export class LikesService {
  #likeRepository;
  #workRepository;

  constructor({ likeRepository, workRepository }) {
    this.#likeRepository = likeRepository;
    this.#workRepository = workRepository;
  }

  // 1. 좋아요 갯수 조회 (GET /works/:workId/likes/count)
  async getLikeCount(workId) {
    const work = await this.#workRepository.findById(workId);
    if (!work) throw new Error('작업물을 찾을 수 없습니다.');

    return this.#likeRepository.countByWorkId(workId);
  }

  // 2. 내 좋아요 클릭 여부 (GET /works/:workId/likes/me)
  async getMyLikeStatus(userId, workId) {
    const like = await this.#likeRepository.findLike(workId, userId);

    // 존재하면 true, 없으면 false 반환
    return !!like;
  }

  // 3. 좋아요 추가 (POST /works/:workId/likes)
  async like(userId, workId) {
    // 대상 작업물 존재 확인
    const work = await this.#workRepository.findById(workId);
    if (!work) throw new Error('작업물을 찾을 수 없습니다.');

    // 중복 좋아요 체크
    const existingLike = await this.#likeRepository.findLike(userId, workId);
    if (existingLike) {
      throw new Error('이미 좋아요를 누른 작업물입니다.');
    }

    return this.#likeRepository.create({
      userId,
      workId,
    });
  }

  // 4. 좋아요 취소 (DELETE /works/:workId/likes)
  async unlike(userId, workId) {
    // 취소할 좋아요가 존재하는지 확인
    const existingLike = await this.#likeRepository.findLike(workId, userId);
    if (!existingLike) {
      throw new Error('취소할 좋아요 기록이 없습니다.');
    }

    // @unique([workId, userId]) 기반으로 삭제 수행
    return this.#likeRepository.delete(workId, userId);
  }
}
