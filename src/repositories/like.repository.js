export class LikeRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  countByWorkId() {}

  findByWorkIdAndUserId() {}

  create() {}

  deleteByWorkIdAndUserId() {}
}
