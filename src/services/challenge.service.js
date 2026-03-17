import { PRISMA_ERROR, ERROR_MESSAGE, HTTP_STATUS } from '#constants';
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
    return this.#challengeRepository.findAllChallenges(options);
  }

  // Admin 챌린지 관리 - 상세 조회(이전/이후 페이지 포함)
  async getChallengeDetailById(challengeId) {
    return await this.#challengeRepository.findChallengeDetailById(challengeId);
  }

  // Admin 챌린지 신청승인/신청거절
  async updateChallengeStatus(challengeId, data, userId) {
    const challenge =
      await this.#challengeRepository.findChallengeById(challengeId);

    if (challenge.isClosed) {
      const error = new Error('완료된 챌린지는 수정 및 삭제가 불가능합니다.');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    const updatedChallenge =
      await this.#challengeRepository.updateChallengeStatus(challengeId, data);

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
  }
}
