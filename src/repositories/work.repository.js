export class WorkRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  async findById(id) {
    return this.#prisma.work.findUnique({
      where: { id },
    });
  }

  async findManyByChallengeId(challengeId) {
    return this.#prisma.work.findMany({
      where: { challengeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 이미 제출한 작업물이 있는지 확인 (참여자 1명당 작업물 1개 제한)
  async findWorkByParticipant(participantId) {
    return this.#prisma.work.findUnique({
      where: { participantId },
    });
  }

  async findByIdWithDetail(id) {
    return this.#prisma.work.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, nickname: true, image: true }, // 필요한 유저 정보만 선택
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  async create(data) {
    return this.#prisma.work.create({ data });
  }

  async update(id, data) {
    return this.#prisma.work.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return this.#prisma.work.delete({
      where: { id },
    });
  }
}
