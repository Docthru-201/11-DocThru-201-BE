import { PRISMA_ERROR, ERROR_MESSAGE, HTTP_STATUS } from '#constants';
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

    const where = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    if (keyword && String(keyword).trim() !== '') {
      where.OR = [
        {
          title: {
            contains: String(keyword).trim(),
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: String(keyword).trim(),
            mode: 'insensitive',
          },
        },
      ];
    }

    const orderBy = { id: 'asc' };

    const {
      cursor: prismaCursor,
      skip,
      take,
      limit: resolvedLimit,
    } = getCursorParams({
      cursor,
      limit,
      cursorKey: 'id',
    });

    const rawItems = await this.#challengeRepository.findManyWithCursor({
      cursor: prismaCursor,
      skip,
      take,
      where,
      orderBy,
    });

    const { items, nextCursor, hasNext } = parseCursorResult({
      items: rawItems,
      requestedLimit: resolvedLimit,
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

  async getChallengeDetail(id) {
    const challenge = await this.#findChallengeOrThrow(id);
    return challenge;
  }

  async createChallenge(data) {
    return await this.#challengeRepository.create(data);
  }

  async updateChallenge(id, userId, updateData) {
    const challenge = await this.#findChallengeOrThrow(id);

    if (challenge.authorId !== userId) {
      throw new Error(ERROR_MESSAGE.NO_AUTHORITY_TO_UPDATE);
    }

    return await this.#challengeRepository.update(id, updateData);
  }

  async deleteChallenge(id, userId) {
    const challenge = await this.#findChallengeOrThrow(id);

    if (challenge.authorId !== userId) {
      throw new Error(
        ERROR_MESSAGE.NO_AUTHORITY_TO_DELETE ??
          ERROR_MESSAGE.N0_AUTHORITY_TO_DELETE,
      );
    }

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
      const error = new Error('완료된 챌린지는 수정 및 삭제가 불가능합니다.');
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
        // message,
      });
    }

    return updatedChallenge;
  }

  async #findChallengeOrThrow(challengeId) {
    const challenge =
      (await this.#challengeRepository.findById?.(challengeId)) ??
      (await this.#challengeRepository.findChallengeById?.(challengeId));

    if (!challenge) {
      throw new Error(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
    }

    return challenge;
  }
}
