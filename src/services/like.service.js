export class LikesService {
  #likeRepository;
  #workRepository;
  #gradeService;

  constructor({ likeRepository, workRepository, gradeService }) {
    this.#likeRepository = likeRepository;
    this.#workRepository = workRepository;
    this.#gradeService = gradeService;
  }

  async getLikeCount(workId) {
    const work = await this.#workRepository.findById(workId);
    if (!work) throw new Error('작업물을 찾을 수 없습니다.');

    // 목록/랭킹과 동일하게 Work.likeCount(비정규화) 기준 — Like 행 개수만 세면 시드·초기값과 불일치
    return work.likeCount ?? 0;
  }

  async getMyLikeStatus(userId, workId) {
    const like = await this.#likeRepository.findLike(workId, userId);

    return !!like;
  }

  async like(userId, workId) {
    const work = await this.#workRepository.findById(workId);
    if (!work) throw new Error('작업물을 찾을 수 없습니다.');

    const existingLike = await this.#likeRepository.findLike(workId, userId);
    if (existingLike) {
      throw new Error('이미 좋아요를 누른 작업물입니다.');
    }

    const result = await this.#likeRepository.create({ userId, workId });

    await this.#workRepository.update(workId, {
      likeCount: { increment: 1 },
    });

    await this.#gradeService.updateGradeIfNeeded(work.userId);

    return result;
  }

  async unlike(userId, workId) {
    const existingLike = await this.#likeRepository.findLike(workId, userId);
    if (!existingLike) {
      throw new Error('취소할 좋아요 기록이 없습니다.');
    }
    const work = await this.#workRepository.findById(workId);
    const result = await this.#likeRepository.delete(workId, userId);

    if (work && work.likeCount > 0) {
      await this.#workRepository.update(workId, {
        likeCount: { decrement: 1 },
      });
    }

    await this.#gradeService.updateGradeIfNeeded(work.userId);

    return result;
  }
}
