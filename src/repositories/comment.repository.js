export class CommentRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  // 특정 work의 모든 댓글 조회 (대댓글 포함)
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

  // 단일 댓글 조회
  async findById(id) {
    return this.#prisma.comment.findUnique({
      where: { id },
      include: {
        author: true,
        replies: { include: { author: true }, orderBy: { createdAt: 'asc' } },
      },
    });
  }

  // 댓글/대댓글 생성
  async create(data) {
    return this.#prisma.comment.create({
      data,
    });
  }

  // 댓글/대댓글 수정
  async update(id, data) {
    return this.#prisma.comment.update({
      where: { id },
      data,
    });
  }

  // 댓글/대댓글 삭제
  async delete(id) {
    return this.#prisma.comment.delete({
      where: { id },
    });
  }

  // 특정 댓글의 대댓글 조회 (optional)
  async findChildren(parentId) {
    return this.#prisma.comment.findMany({
      where: { parentId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
