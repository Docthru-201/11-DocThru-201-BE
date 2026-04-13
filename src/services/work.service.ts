import { ERROR_MESSAGE } from '#constants';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
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
  // userId 없음(비로그인): 목록만 반환, isLiked는 모두 false
  async getAllWorks(userId, challengeId, page, pageSize) {
    if (!challengeId) {
      throw new BadRequestException(ERROR_MESSAGE.CHALLENGE_ID_REQUIRED);
    }

    const works = await this.#workRepository.findManyByChallengeId(
      challengeId,
      page,
      pageSize,
    );

    if (!userId) {
      return works.map((work) => ({
        ...work,
        isLiked: false,
      }));
    }

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
      throw new BadRequestException(ERROR_MESSAGE.REQUIRED_FIELDS_MISSING);
    }

    // 1. 챌린지 존재 확인
    const challenge =
      await this.#challengeRepository.findChallengeById(challengeId);
    if (!challenge) {
      throw new NotFoundException(ERROR_MESSAGE.RESOURCE_NOT_FOUND);
    }

    // 2. 챌린지 마감 여부 확인
    if (challenge.isClosed || challenge.status === 'CLOSED') {
      throw new ForbiddenException(ERROR_MESSAGE.CHALLENGE_ALREADY_CLOSED);
    }

    // 3. 중복 작업물 확인
    await this.isWorkDuplicate(challengeId, userId);

    // 4. 작업물 생성
    const result = await this.#workRepository.createWork(challengeId, userId);

    // 5. 챌린지 작성자 + 참가자에게 알림 발송 (작업물 작성자는 제외)
    const challengeInfo =
      await this.#challengeRepository.findNotificationRecipientsByChallengeId(
        challengeId,
      );

    if (challengeInfo && this.#notificationsService) {
      const recipientIds = [
        challengeInfo.authorId,
        ...challengeInfo.participants.map((participant) => participant.userId),
      ].filter((recipientId) => recipientId && recipientId !== userId);

      const uniqueRecipientIds = [...new Set(recipientIds)];

      for (const recipientId of uniqueRecipientIds) {
        await this.#notificationsService.createNotification({
          userId: recipientId,
          type: 'NEW_WORK',
          targetId: result.id,
          targetUrl: `/challenges/${challengeId}`,
          message: `'${challenge.title}' 챌린지에 새로운 작업물이 등록되었어요`,
        });
      }
    }

    return result;
  }

  // 이미 등록된 작업물 확인
  async isWorkDuplicate(challengeId, authorId) {
    const hasWork = await this.#workRepository.hasSubmittedWork(
      challengeId,
      authorId,
    );

    if (hasWork) {
      throw new ConflictException(ERROR_MESSAGE.ALREADY_SUBMITTED_WORK);
    }
  }

  async updateWork(workId, userId, { content, action, title }) {
    const work = await this.#workRepository.findById(workId);

    if (!work) throw new NotFoundException('작업물이 없습니다.');
    if (work.userId !== userId)
      throw new ForbiddenException('수정 권한이 없습니다.');

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;

    if (action === 'SUBMIT') {
      if (content !== undefined) updateData.content = content;
      updateData.draftContent = null;
      if (work.status === 'DRAFT') {
        updateData.status = 'SUBMITTED';
        updateData.submittedAt = new Date();
      }
    } else {
      if (work.status === 'SUBMITTED') {
        if (content !== undefined) updateData.draftContent = content;
      } else {
        if (content !== undefined) updateData.content = content;
      }
    }

    const updatedWork = await this.#workRepository.update(workId, updateData);

    const challengeInfo =
      await this.#challengeRepository.findNotificationRecipientsByChallengeId(
        work.challengeId,
      );

    if (challengeInfo && this.#notificationsService) {
      const recipientIds = [
        challengeInfo.authorId,
        ...challengeInfo.participants.map((participant) => participant.userId),
      ].filter((recipientId) => recipientId && recipientId !== userId);

      const uniqueRecipientIds = [...new Set(recipientIds)];

      for (const recipientId of uniqueRecipientIds) {
        await this.#notificationsService.createNotification({
          userId: recipientId,
          type: 'ADMIN_ACTION',
          targetId: updatedWork.id,
          targetUrl: `/challenges/${work.challengeId}`,
          message: `'${challengeInfo.title}' 챌린지의 작업물이 수정되었어요.`,
        });
      }
    }

    return updatedWork;
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
      return null;
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

    const challengeInfo =
      await this.#challengeRepository.findNotificationRecipientsByChallengeId(
        work.challengeId,
      );

    await this.#workRepository.delete(workId);

    await this.#participantRepository.deleteByUserAndChallenge(
      userId,
      work.challengeId,
    );
    await this.#gradeService.updateGradeIfNeeded(userId);

    if (challengeInfo && this.#notificationsService) {
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
          targetId: workId,
          targetUrl: `/challenges/${work.challengeId}`,
          message: `'${challengeInfo.title}' 챌린지의 작업물이 삭제되었어요. (${deletedAt})`,
        });
      }
    }
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

  async getMyWorks(userId) {
    return this.#workRepository.findManyByUserId(userId);
  }
}
