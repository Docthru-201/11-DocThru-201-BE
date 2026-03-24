import { ERROR_MESSAGE, HTTP_STATUS } from '#constants';
import { getCursorParams, parseCursorResult } from '#utils';

export class ChallengesService {
  #challengeRepository;
  #notificationsService;

  constructor({ challengeRepository, notificationsService }) {
    this.#challengeRepository = challengeRepository;
    this.#notificationsService = notificationsService;
  }

  async listChallenges(query) {
    const { cursor, limit, status, category, type, keyword } = query;

    const where = {
      ...(status && { status }),
      ...(category && { category }),
      ...(type && { type }),
      ...(keyword && {
        OR: [
          {
            title: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const orderBy = { id: 'asc' };

    const paginationParams = getCursorParams({
      cursor,
      limit,
      cursorKey: 'id',
    });

    const rawItems = await this.#challengeRepository.findManyWithCursor({
      cursor: paginationParams.cursor,
      skip: paginationParams.skip,
      take: paginationParams.take,
      where,
      orderBy,
    });

    const { items, nextCursor, hasNext } = parseCursorResult({
      items: rawItems,
      limit: paginationParams.limit,
      cursorKey: 'id',
    });

    return {
      message: '챌린지 목록 조회 성공',
      data: {
        items,
        pagination: {
          nextCursor,
          hasNext,
        },
      },
    };
  }

  async getChallengeDetail(challengeId) {
    const challenge = await this.#findChallengeOrThrow(challengeId);
    return challenge;
  }

  async createChallenge(data) {
    return await this.#challengeRepository.create(data);
  }

  async updateChallenge(id, updateData) {
    // userId 파라미터 제거
    const challenge = await this.#findChallengeOrThrow(id);
    return await this.#challengeRepository.update(id, updateData);
  }

  async deleteChallenge(id) {
    // userId 파라미터 제거
    await this.#findChallengeOrThrow(id);
    await this.#challengeRepository.delete(id);
  }

  async getChallengesByUser(userId) {
    return await this.#challengeRepository.findByUserId(userId);
  }

  // Admin 챌린지 관리 조회
  async getAllChallenges({
    page = 1,
    pageSize = 10,
    sort = '',
    keyword,
    userId,
  }) {
    const offset = (page - 1) * pageSize;

    const options = {
      skip: offset,
      take: pageSize,
      where: {},
      orderBy: { createdAt: 'desc' },
    };

    // admin인 경우는 전체 조회라서 userId를 넘기지 않음
    if (userId) {
      options.where.authorId = userId;
    }

    const statusValues = ['pending', 'approved', 'rejected'];
    if (statusValues.includes(sort.toLowerCase())) {
      options.where.status = sort.toUpperCase();
    }

    const sortOptions = {
      createdAt_asc: { createdAt: 'asc' },
      createdAt_desc: { createdAt: 'desc' },
      deadline_asc: { deadline: 'asc' },
      deadline_desc: { deadline: 'desc' },
    };

    if (sortOptions[sort]) {
      options.orderBy = sortOptions[sort];
    }

    if (keyword) {
      options.where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    return await this.#challengeRepository.findAllChallenges(options);
  }

  // Admin 챌린지 관리 - 상세 조회(이전/이후 페이지 포함)
  async getChallengeDetailById(challengeId) {
    return await this.#challengeRepository.findChallengeDetailById(challengeId);
  }

  // Admin 챌린지 신청승인/신청거절
  async updateChallengeStatus(challengeId, data, userId) {
    const challenge = await this.#findChallengeOrThrow(challengeId);

    if (challenge.isClosed) {
      const error = new Error(ERROR_MESSAGE.CANNOT_MODIFY_CLOSED_CHALLENGE);
      error.statusCode = HTTP_STATUS.FORBIDDEN;

      throw error;
    }

    const updatedChallenge =
      await this.#challengeRepository.updateChallengeStatus(challengeId, data);

    // 알림 전송
    if (
      this.#notificationsService &&
      challenge.authorId &&
      challenge.authorId !== userId
    ) {
      const { status, declineReason, title, id } = updatedChallenge;

      const message = ['REJECTED', 'DELETED'].includes(status)
        ? this.#notificationsService.notificationMessages?.adminReviewResult?.(
            title,
            status,
            declineReason,
          )
        : this.#notificationsService.notificationMessages?.challengeProgressUpdate?.(
            title,
            status,
          );

      await this.#notificationsService.createNotification({
        userId: challenge.authorId,
        type: 'CHALLENGE_APPROVAL_RESULT',
        targetId: id,
        targetUrl: `/challenges/${id}`,
        message: message,
      });
    }

    return updatedChallenge;
  }

  async #findChallengeOrThrow(challengeId) {
    const challenge =
      // 1개라도 Repository가 정의되지 않으면 undefined 에러로 주석-swlee
      // (await this.#challengeRepository.findById?.(challengeId)) ??
      await this.#challengeRepository.findChallengeById?.(challengeId);

    if (!challenge) {
      const error = new Error(ERROR_MESSAGE.RESOURCE_NOT_FOUND); // "존재하지 않는 챌린지"
      error.statusCode = HTTP_STATUS.NOT_FOUND; //404
      throw error;
    }

    console.log('서비스 결과(#findChallengeOrThrow) =======>:', challenge);
    return challenge;
  }
}
