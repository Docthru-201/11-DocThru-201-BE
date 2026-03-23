import { ERROR_MESSAGE, HTTP_STATUS } from '#constants';
export class WorksService {
  #workRepository;
  #likeRepository;
  #challengeRepository;
  #notificationsService;

  constructor({
    workRepository,
    likeRepository,
    challengeRepository,
    notificationsService,
  }) {
    this.#workRepository = workRepository;
    this.#likeRepository = likeRepository;
    this.#challengeRepository = challengeRepository;
    this.#notificationsService = notificationsService;
  }

  // 챌린지에 속한 모든 작업물을 페이지네이션 및 각 작업물의 좋아요 상태 포함하여 반환
  async getAllWorks(userId, challengeId, page, pageSize) {
    if (!userId) {
      const error = new Error(ERROR_MESSAGE.USER_ID_REQUIRED); // 신규 추가 권장
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }
    if (!challengeId) {
      const error = new Error(ERROR_MESSAGE.CHALLENGE_ID_REQUIRED); // 신규 추가 권장
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    const works = await this.#workRepository.findManyByChallengeId(
      challengeId,
      page,
      pageSize,
      userId,
    );
    const currentWorkIdList = works.map((work) => work.workId);
    const userLikeRecords = await this.#likeRepository.findManyLiked({
      where: {
        userId: userId,
        workId: { in: currentWorkIdList },
      },
      select: { workId: true },
    });
    const likedWorkIdSet = new Set(
      userLikeRecords.map((record) => record.workId),
    );

    const worksWithLikeStatus = works.map((work) => ({
      ...work,
      isLiked: likedWorkIdSet.has(work.workId),
    }));
    return worksWithLikeStatus;
  }

  // 새로운 작업물을 생성하고 챌린지 참여자로 등록
  async createWork(challengeId, participantId) {
    if (!challengeId || !participantId) {
      const error = new Error(ERROR_MESSAGE.REQUIRED_FIELDS_MISSING);
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    const challenge =
      await this.#challengeRepository.findChallengeById(challengeId);

    if (!challenge) {
      const error = new Error(ERROR_MESSAGE.RESOURCE_NOT_FOUND);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    if (challenge.isClosed) {
      const error = new Error(ERROR_MESSAGE.CHALLENGE_ALREADY_CLOSED);
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }
    await this.isWorkDuplicate(challengeId, participantId);

    const result = await this.#workRepository.createWork(
      challengeId,
      participantId,
    );

    if (challenge.authorId !== participantId) {
      this.#sendNotificationSilently(challenge.authorId, challenge.title);
    }

    return result;
  }

  async #sendNotificationSilently(authorId, title) {
    try {
      const message =
        this.#notificationsService.notificationMessages.newWork(title);
      await this.#notificationsService.createNotification(authorId, message);
    } catch (notiError) {
      console.error(
        `[Notification Error] User: ${authorId} - ${notiError.message}`,
      );
    }
  }
  
 //이미 등록된 작업물 확인
  async isWorkDuplicate(challengeId, authorId) {
    const hasWork = await this.#workRepository.hasSubmittedWork(
      challengeId,
      authorId,
    );

    if (hasWork) {
      const error = new Error(ERROR_MESSAGE.ALREADY_SUBMITTED_WORK);
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }
  }

  async getWorkDetail() {}

  async updateWork() {}

  async deleteWork() {}
}
