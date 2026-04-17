export class LikesService {
  #likeRepository;

  constructor({ likeRepository }) {
    this.#likeRepository = likeRepository;
  }

  async getLikeCount() {}

  async getMyLikeStatus() {}

  async like() {}

  async unlike() {}
}
