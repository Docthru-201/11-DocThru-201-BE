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
      deletedAt: null,
      ...(status ? { status } : {}),
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
    const challenge = await this.#challengeRepository.create(data);

    await this.#challengeRepository.createParticipant({
      userId: data.authorId,
      challengeId: challenge.id,
    });
    console.log('notificationsService exists:', !!this.#notificationsService);
    if (this.#notificationsService) {
      const admin = await this.#challengeRepository.findAdminUser();
      console.log('admin:', admin);

      if (admin && admin.id !== data.authorId) {
        const notification =
          await this.#notificationsService.createNotification({
            userId: admin.id,
            type: 'ADMIN_ACTION',
            targetId: challenge.id,
            targetUrl: `/challenges/${challenge.id}`,
            message: `'${challenge.title}' 챌린지가 등록되었어요`,
          });

        console.log('created notification:', notification);
      }
    }

    return challenge;
  }

  async updateChallenge(id, updateData, userId) {
    await this.#findChallengeOrThrow(id);

    const updatedChallenge = await this.#challengeRepository.update(
      id,
      updateData,
    );

    if (!this.#notificationsService) {
      return updatedChallenge;
    }

    const challengeInfo =
      await this.#challengeRepository.findNotificationRecipientsByChallengeId(
        id,
      );

    if (!challengeInfo) {
      return updatedChallenge;
    }

    const changedAt = new Date(updatedChallenge.updatedAt || new Date())
      .toISOString()
      .slice(0, 10);

    const recipientIds = [
      challengeInfo.authorId,
      ...challengeInfo.participants.map((participant) => participant.userId),
    ].filter((recipientId) => recipientId && recipientId !== userId);

    const uniqueRecipientIds = [...new Set(recipientIds)];

    const reasonText = updateData.reason ? ` 사유: ${updateData.reason}` : '';

    const message = updateData.reason
      ? `'${updatedChallenge.title}' 챌린지가 수정되었어요. ${reasonText}`
      : `'${updatedChallenge.title}' 챌린지가 수정되었어요. `;

    for (const recipientId of uniqueRecipientIds) {
      await this.#notificationsService.createNotification({
        userId: recipientId,
        type: 'ADMIN_ACTION',
        targetId: updatedChallenge.id,
        targetUrl: `/challenges/${updatedChallenge.id}`,
        message,
      });
    }

    return updatedChallenge;
  }

  async deleteChallenge(id, userId) {
    const challenge = await this.#findChallengeOrThrow(id);

    const challengeInfo =
      await this.#challengeRepository.findNotificationRecipientsByChallengeId(
        id,
      );

    await this.#challengeRepository.delete(id);

    if (!this.#notificationsService || !challengeInfo) {
      return;
    }

    const deletedAt = new Date().toISOString().slice(0, 10);

    const recipientIds = [
      challengeInfo.authorId,
      ...challengeInfo.participants.map((participant) => participant.userId),
    ].filter((recipientId) => recipientId && recipientId !== userId);

    const uniqueRecipientIds = [...new Set(recipientIds)];

    for (const recipientId of uniqueRecipientIds) {
      await this.#notificationsService.createNotification({
        userId: recipientId,
        type: 'ADMIN_ACTION',
        targetId: id,
        targetUrl: `/challenges/${id}`,
        message: `'${challenge.title}' 챌린지가 삭제되었어요. (${deletedAt})`,
      });
    }
  }

  async getChallengesByUser(userId) {
    return await this.#challengeRepository.findByUserId(userId);
  }

  async getMyChallengesForTabs(userId, tab) {
    const normalizedTab =
      tab === 'applied' || tab === 'done' || tab === 'participating'
        ? tab
        : 'participating';

    let rows;
    if (normalizedTab === 'applied') {
      // 신청한 챌린지: 내가 직접 신청(작성)한 챌린지 중 승인 대기
      const authored =
        await this.#challengeRepository.findByAuthorIdForMyList(userId);
      rows = authored.filter((c) => c.status === 'PENDING');
    } else if (normalizedTab === 'done') {
      // 완료: 내가 work를 제출한 챌린지 중 마감됨
      rows = await this.#challengeRepository.findBySubmittedWorkForMyList(
        userId,
        {
          isClosed: true,
        },
      );
    } else {
      // 참여중: 내가 work를 제출한 챌린지 중 아직 진행중(마감 전)
      rows = await this.#challengeRepository.findBySubmittedWorkForMyList(
        userId,
        {
          isClosed: false,
        },
      );
    }

    const isParticipantTab =
      normalizedTab === 'participating' || normalizedTab === 'done';
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
    await this.#findChallengeOrThrow(challengeId);

    const updatedChallenge =
      await this.#challengeRepository.updateChallengeStatus(challengeId, data);

    if (!this.#notificationsService) {
      return updatedChallenge;
    }

    const challengeInfo =
      await this.#challengeRepository.findNotificationRecipientsByChallengeId(
        challengeId,
      );

    if (!challengeInfo) {
      return updatedChallenge;
    }

    const changedAt = new Date(updatedChallenge.updatedAt || new Date())
      .toISOString()
      .slice(0, 10);

    const recipientIds = [
      challengeInfo.authorId,
      ...challengeInfo.participants.map((participant) => participant.userId),
    ].filter((recipientId) => recipientId && recipientId !== userId);

    const uniqueRecipientIds = [...new Set(recipientIds)];
    const statusMessages = {
      APPROVED: '승인되었어요.',
      REJECTED: '거절되었어요.',
      DELETED: '삭제되었어요.',
    };

    const statusText =
      statusMessages[updatedChallenge.status] || '정보가 변경되었어요.';

    const showReason =
      updatedChallenge.status !== 'APPROVED' && updatedChallenge.declineReason;
    const reasonText = showReason
      ? ` 사유: ${updatedChallenge.declineReason}`
      : '';

    const message = `'${updatedChallenge.title}' 챌린지가 ${statusText}${reasonText}`;

    for (const recipientId of uniqueRecipientIds) {
      await this.#notificationsService.createNotification({
        userId: recipientId,
        type: 'ADMIN_ACTION',
        targetId: updatedChallenge.id,
        targetUrl: `/challenges/${updatedChallenge.id}`,
        message,
      });
    }

    return updatedChallenge;
  }

  async #findChallengeOrThrow(challengeId) {
    const challenge =
      await this.#challengeRepository.findChallengeById?.(challengeId);

    if (!challenge) {
      const error = new Error(ERROR_MESSAGE.RESOURCE_NOT_FOUND);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    return challenge;
  }
}
