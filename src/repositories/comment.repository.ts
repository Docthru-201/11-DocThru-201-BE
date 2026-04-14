import type { PrismaClient, Prisma } from '#generated/prisma/client.js';

export class CommentRepository {
  #prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.#prisma = prisma;
  }
  async findManyByWorkId(workId: string) {
    return this.#prisma.comment.findMany({
      where: { workId, parentId: null },
      orderBy: { createdAt: 'asc' },
      include: {
        author: true,
        replies: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findById(id: string) {
    return this.#prisma.comment.findUnique({
      where: { id },
      include: {
        author: true,
        replies: { include: { author: true }, orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async create(data: Prisma.CommentCreateInput) {
    return this.#prisma.comment.create({
      data,
    });
  }

  async update(commentId: string, data: Prisma.CommentUpdateInput) {
    return this.#prisma.comment.update({
      where: { id: commentId },
      data,
    });
  }

  async delete(commentId: string) {
    return this.#prisma.comment.delete({
      where: { id: commentId },
    });
  }
  async softDelete(commentId: string) {
    return this.#prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
  }

  // 특정 댓글의 대댓글 조회
  async findChildren(parentId: string) {
    return this.#prisma.comment.findMany({
      where: { parentId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
