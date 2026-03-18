export class WorksService {
  #workRepository;
  #likeRepository;

  constructor({ workRepository, likeRepository }) {
    this.#workRepository = workRepository;
    this.#likeRepository = likeRepository;
  }

  async createWork() {}

  async getWorkDetail() {}

  async updateWork() {}

  async deleteWork() {}

  // 챌린지에 속한 모든 작업물을 페이지네이션 및 각 작업물의 좋아요 상태 포함하여 반환
  async getAllWorks(userId, challengeId, page, pageSize) {
    if (!userId) {
      const error = new Error('사용자 아이디가 필요합니다.');
      error.statusCode = 400;
      throw error;
    }
    if (!challengeId) {
      const error = new Error('챌린지 아이디가 필요합니다.');
      error.statusCode = 400;
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
}
