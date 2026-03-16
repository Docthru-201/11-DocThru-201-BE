import { PRISMA_ERROR, ERROR_MESSAGE, HTTP_STATUS } from '#constants/errors.js';
export class ChallengesService {
  #challengeRepository;
  #notificationsService;

  constructor({ challengeRepository, notificationsService }) {
    this.#challengeRepository = challengeRepository;
    this.#notificationsService = notificationsService;
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

    //admin인 경우는 전체라서 userId 넘겨주지 않음
    if (userId) {
      options.where.authorId = userId;
    }

    const statusValues = ['pending', 'approved', 'rejected'];
    if (statusValues.includes(sort.toLowerCase())) {
      options.where.status = sort.toUpperCase();
    }

    if (sort === 'createdAt_asc') {
      options.orderBy = { createdAt: 'asc' };
    } else if (sort === 'createdAt_desc') {
      options.orderBy = { createdAt: 'desc' };
    } else if (sort === 'deadline_asc') {
      options.orderBy = { deadline: 'asc' };
    } else if (sort === 'deadline_desc') {
      options.orderBy = { deadline: 'desc' };
    }

    if (keyword) {
      options.where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }
    return this.#challengeRepository.findAllChallenges(options);
  }

  // Admin 챌린지 관리 - 상세 조회(이전/이후 페이지 포함)
  async getChallengeDetailById(challengeId) {
    return await this.#challengeRepository.findChallengeDetailById(challengeId);
  }

  // Admin 챌린지 신청승인/신청거절
  async updateChallengeStatus(challengeId, data, userId) {
    try {
      const challenge =
        await this.#challengeRepository.findChallengeById(challengeId);
      if (challenge.isClosed) {
        const error = new Error('완료된 챌린지는 수정 및 삭제가 불가능합니다.');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      const updatedChallenge =
        await this.#challengeRepository.updateChallengeStatus(
          challengeId,
          data,
        );

      // 알림 전송
      if (challenge.authorId !== userId) {
        const { status, declineReason, title, id } = updatedChallenge;
        // message String // TODO: 논의중인 사안
        const message = ['REJECTED', 'DELETED'].includes(status)
          ? this.#notificationsService.notificationMessages.adminReviewResult(
              title,
              status,
              declineReason,
            )
          : this.#notificationsService.notificationMessages.challengeProgressUpdate(
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
    } catch (e) {
      if (e.code === PRISMA_ERROR.RECORD_NOT_FOUND) {
        const error = new Error(ERROR_MESSAGE.RESOURCE_NOT_FOUND);
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }
      throw e;
    }
  }
}
