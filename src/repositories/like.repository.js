export class LikeRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  async countByWorkId(workId) {
    return this.#prisma.like.count({
      where: { workId },
    });
  }

  async findLike(workId, userId) {
    return this.#prisma.like.findUnique({
      where: {
        workId_userId: {
          workId,
          userId,
        },
      },
    });
  }

  async create(data) {
    return this.#prisma.like.create({
      data: {
        workId: data.workId,
        userId: data.userId,
      },
    });
  }

  async delete(workId, userId) {
    return this.#prisma.like.delete({
      where: {
        workId_userId: {
          workId,
          userId,
        },
      },
    });
  }

  async findManyLiked({ userId, workIds }) {
    return await this.#prisma.like.findMany({
      where: {
        userId: userId,
        workId: { in: workIds },
      },
      select: { workId: true },
    });
  }

  async countReceivedByUserId(userId) {
    return this.#prisma.like.count({
      where: {
        work: { userId },
      },
    });
  }
}
