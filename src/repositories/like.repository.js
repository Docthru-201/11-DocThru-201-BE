export class LikeRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  countByWorkId() {}

  findByWorkIdAndUserId() {}

  create() {}

  deleteByWorkIdAndUserId() {}

  // findByWorkIdAndUserId와 같은것인지 확인 swlee
  async findManyLiked({ userId, workIds }) {
  return await this.#prisma.like.findMany({
    where: {
      userId: userId,
      workId: { in: workIds },
    },
    select: { workId: true },
  });
}
}
