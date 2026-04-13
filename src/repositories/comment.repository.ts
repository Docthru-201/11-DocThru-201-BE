export class CommentRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }
  async findManyByWorkId(workId) {
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

  async findById(id) {
    return this.#prisma.comment.findUnique({
      where: { id },
      include: {
        author: true,
        replies: { include: { author: true }, orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async create(data) {
    return this.#prisma.comment.create({
      data,
    });
  }

  async update(commentId, data) {
    return this.#prisma.comment.update({
      where: { id: commentId },
      data,
    });
  }

  async delete(commentId) {
    return this.#prisma.comment.delete({
      where: { id: commentId },
    });
  }
  async softDelete(commentId) {
    return this.#prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
  }

  // 특정 댓글의 대댓글 조회
  async findChildren(parentId) {
    return this.#prisma.comment.findMany({
      where: { parentId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
