import type { PrismaClient } from '#generated/prisma/client.js';

export class LikeRepository {
  #prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.#prisma = prisma;
  }

  async countByWorkId(workId: string) {
    return this.#prisma.like.count({
      where: { workId },
    });
  }

  async findLike(workId: string, userId: string) {
    return this.#prisma.like.findUnique({
      where: {
        workId_userId: {
          workId,
          userId,
        },
      },
    });
  }

  async create(data: { workId: string; userId: string }) {
    return this.#prisma.like.create({
      data: {
        workId: data.workId,
        userId: data.userId,
      },
    });
  }

  async delete(workId: string, userId: string) {
    return this.#prisma.like.delete({
      where: {
        workId_userId: {
          workId,
          userId,
        },
      },
    });
  }

  async findManyLiked({
    userId,
    workIds,
  }: {
    userId: string;
    workIds: string[];
  }) {
    return await this.#prisma.like.findMany({
      where: {
        userId: userId,
        workId: { in: workIds },
      },
      select: { workId: true },
    });
  }

  async countReceivedByUserId(userId: string) {
    return this.#prisma.like.count({
      where: {
        work: { userId },
      },
    });
  }
}
