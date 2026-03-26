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

    // 공개 목록: 기본은 승인된 챌린지만. 쿼리에 status가 있으면 해당 값으로 필터.
    const where = {
      deletedAt: null,
      ...(status ? { status } : { status: 'APPROVED' }),
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

    const listInclude = {
      author: {
        select: { id: true, nickname: true, image: true },
      },
      _count: {
        select: { participants: true },
      },
    };

    const rawItems = await this.#challengeRepository.findManyWithCursor({
      cursor: paginationParams.cursor,
      skip: paginationParams.skip,
      take: paginationParams.take,
      where,
      orderBy,
      include: listInclude,
    });

    const mapped = rawItems.map((row) => this.#mapChallengeListItem(row));

    const { items, nextCursor, hasNext } = parseCursorResult({
      items: mapped,
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

  #mapChallengeListItem(row) {
    const { _count, ...rest } = row;
    const deadline = rest.deadline;
    const deadlineDate =
      deadline instanceof Date ? deadline : new Date(deadline);
    const participantCount = _count?.participants ?? 0;

    return {
      ...rest,
      currentParticipants: participantCount,
      deadline: deadlineDate.toISOString().slice(0, 10),
      isDeadlinePassed: deadlineDate < new Date(),
      isRecruitmentFull: participantCount >= rest.maxParticipants,
      isParticipating: false,
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
    const challenge = await this.#findChallengeOrThrow(id);
    return await this.#challengeRepository.update(id, updateData);
  }

  async deleteChallenge(id) {
    await this.#findChallengeOrThrow(id);
    await this.#challengeRepository.delete(id);
  }

  async getChallengesByUser(userId) {
    return await this.#challengeRepository.findByUserId(userId);
  }

  async getMyChallengesForTabs(userId, tab) {
    let rows;
    if (tab === 'applied') {
      const authored =
        await this.#challengeRepository.findByAuthorIdForMyList(userId);
      rows = authored.filter((c) => c.status === 'PENDING');
    } else if (tab === 'participating') {
      const joined =
        await this.#challengeRepository.findByParticipantUserIdForMyList(
          userId,
        );
      rows = joined.filter((c) => !c.isClosed);
    } else {
      const joined =
        await this.#challengeRepository.findByParticipantUserIdForMyList(
          userId,
        );
      rows = joined.filter((c) => c.isClosed);
    }

    const isParticipantTab = tab === 'participating' || tab === 'done';
    const items = rows.map((row) => ({
      ...this.#mapChallengeListItem(row),
      isParticipating: isParticipantTab,
    }));

    return {
      message: '나의 챌린지 조회 성공',
      data: {
        items,
        pagination: {
          nextCursor: null,
          hasNext: false,
        },
      },
    };
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

  async getChallengeDetailById(challengeId) {
    return await this.#challengeRepository.findChallengeDetailById(challengeId);
  }

  async updateChallengeStatus(challengeId, data, userId) {
    const challenge = await this.#findChallengeOrThrow(challengeId);

    // 논리적으로 Admin은 마감날짜에 관계없이 승인/거절/삭제 처리 가능하도록 제외
    // if (challenge.isClosed) {
    //   const error = new Error(ERROR_MESSAGE.CANNOT_MODIFY_CLOSED_CHALLENGE);
    //   error.statusCode = HTTP_STATUS.FORBIDDEN;

    //   throw error;
    // }

    const updatedChallenge =
      await this.#challengeRepository.updateChallengeStatus(challengeId, data);

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

    return challenge;
  }
}
