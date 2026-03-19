export class LikeRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  // 특정 작업물의 전체 좋아요 개수 조회
  async countByWorkId(workId) {
    return this.#prisma.like.count({
      where: { workId },
    });
  }

  // 특정 유저가 특정 작업물에 좋아요를 눌렀는지 확인 (단건 조회)
  async findLike(workId, userId) {
    return this.#prisma.like.findUnique({
      where: {
        // Prisma의 복합 유니크 키 접근 방식: workId_userId
        workId_userId: {
          workId,
          userId,
        },
      },
    });
  }

  // 좋아요 생성
  async create(data) {
    return this.#prisma.like.create({
      data: {
        workId: data.workId,
        userId: data.userId,
      },
    });
  }

  // 좋아요 삭제 (복합 키를 이용한 정밀 삭제)
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
}
