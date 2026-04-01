import { ERROR_MESSAGE, HTTP_STATUS } from '#constants';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '#exceptions';

export class WorksService {
  #workRepository;
  #likeRepository;
  #challengeRepository;
  #notificationsService;
  #participantRepository;
  #gradeService;

  constructor({
    workRepository,
    likeRepository,
    challengeRepository,
    notificationsService,
    participantRepository,
    gradeService,
  }) {
    this.#workRepository = workRepository;
    this.#likeRepository = likeRepository;
    this.#challengeRepository = challengeRepository;
    this.#notificationsService = notificationsService;
    this.#participantRepository = participantRepository;
    this.#gradeService = gradeService;
  }

  // 챌린지에 속한 모든 작업물을 페이지네이션 및 각 작업물의 좋아요 상태 포함하여 반환
  async getAllWorks(userId, challengeId, page, pageSize) {
    if (!userId) {
      const error = new Error(ERROR_MESSAGE.USER_ID_REQUIRED);
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }
    if (!challengeId) {
      const error = new Error(ERROR_MESSAGE.CHALLENGE_ID_REQUIRED);
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
      userId,
      workIds: currentWorkIdList,
    });
    const likedWorkIdSet = new Set(
      userLikeRecords.map((record) => record.workId),
    );

    return works.map((work) => ({
      ...work,
      isLiked: likedWorkIdSet.has(work.workId),
    }));
  }

  // 새로운 작업물을 생성하고 챌린지 참여자로 등록
  async createWork(challengeId, userId) {
    if (!challengeId || !userId) {
      const error = new Error(ERROR_MESSAGE.REQUIRED_FIELDS_MISSING);
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    // 1. 챌린지 존재 확인
    const challenge =
      await this.#challengeRepository.findChallengeById(challengeId);
    if (!challenge) {
      const error = new Error(ERROR_MESSAGE.RESOURCE_NOT_FOUND);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // 2. 챌린지 마감 여부 확인
    if (challenge.isClosed || challenge.status === 'CLOSED') {
      const error = new Error(ERROR_MESSAGE.CHALLENGE_ALREADY_CLOSED);
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // 3. 중복 작업물 확인
    await this.isWorkDuplicate(challengeId, userId);

    // 5. 작업물 생성
    const result = await this.#workRepository.createWork(challengeId, userId);

    // 6. 챌린지 작성자에게 알림 발송 (본인이 아닐 때만)
    if (challenge.authorId !== userId) {
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

  // 이미 등록된 작업물 확인
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

  // action: 'SUBMIT' → 제출하기 (DRAFT→SUBMITTED) 또는 수정하기 (이미 SUBMITTED)
  // action 없음 → 임시저장 (DRAFT 유지, content만 업데이트)
  async updateWork(workId, userId, { content, action }) {
    const work = await this.#workRepository.findById(workId);

    if (!work) {
      throw new NotFoundException('작업물이 없습니다.');
    }

    if (work.userId !== userId) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    const updateData = {};
    if (content !== undefined) updateData.content = content;

    if (action === 'SUBMIT') {
      if (work.status === 'DRAFT') {
        // 제출하기: DRAFT → SUBMITTED
        updateData.status = 'SUBMITTED';
        updateData.submittedAt = new Date();
      }
      // 수정하기: 이미 SUBMITTED이면 status/submittedAt 변경 없이 content만 업데이트
    }
    // 임시저장: action 없음 → status는 DRAFT 그대로 유지

    return this.#workRepository.update(workId, updateData);
  }

  async getMyWork(challengeId, userId) {
    if (!challengeId || !userId) {
      throw new BadRequestException(ERROR_MESSAGE.REQUIRED_FIELDS_MISSING);
    }

    const work = await this.#workRepository.findMyWorkByChallengeId(
      challengeId,
      userId,
    );

    if (!work) {
      throw new NotFoundException('작업물이 없습니다.');
    }

    const isLiked = !!(await this.#likeRepository.findLike(work.id, userId));
    return { ...work, isLiked };
  }

  async deleteWork(workId, userId) {
    const work = await this.#workRepository.findById(workId);

    if (!work) {
      throw new NotFoundException('작업물이 없습니다.');
    }

    if (work.userId !== userId) {
      throw new ForbiddenException('삭제 권한이 없습니다.');
    }

    await this.#workRepository.delete(workId);

    await this.#participantRepository.deleteByUserAndChallenge(
      userId,
      work.challengeId,
    );
    await this.#gradeService.updateGradeIfNeeded(userId);
  }

  async getWorkById(workId, userId) {
    const work = await this.#workRepository.findByIdWithDetail(workId);

    if (!work) {
      throw new NotFoundException('작업물이 없습니다.');
    }

    // 좋아요 여부 포함
    const isLiked = userId
      ? !!(await this.#likeRepository.findLike(workId, userId))
      : false;

    return { ...work, isLiked };
  }
}
