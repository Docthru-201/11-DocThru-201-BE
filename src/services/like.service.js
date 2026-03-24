export class LikesService {
  #likeRepository;
  #workRepository;

  constructor({ likeRepository, workRepository }) {
    this.#likeRepository = likeRepository;
    this.#workRepository = workRepository;
  }

  async getLikeCount(workId) {
    const work = await this.#workRepository.findById(workId);
    if (!work) throw new Error('작업물을 찾을 수 없습니다.');

    return this.#likeRepository.countByWorkId(workId);
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

    return this.#likeRepository.create({
      userId,
      workId,
    });
  }

  async unlike(userId, workId) {
    const existingLike = await this.#likeRepository.findLike(workId, userId);
    if (!existingLike) {
      throw new Error('취소할 좋아요 기록이 없습니다.');
    }
    return this.#likeRepository.delete(workId, userId);
  }
}
