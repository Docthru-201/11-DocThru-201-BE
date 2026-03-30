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

  //현재 챌린지의 모든 work 조회-swlee
  async findManyByChallengeId(challengeId, page, pageSize) {
    const works = await this.#prisma.work.findMany({
      where: { challengeId },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
        user: {
          select: {
            id: true,
            nickname: true,
            grade: true,
          },
        },
        challenge: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        likeCount: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return works.map((work) => ({
      workId: work.id,
      author: {
        authorId: work.user.id,
        authorNickname: work.user.nickname,
        grade: work.user.grade,
      },
      challengeId: work.challengeId,
      challengeTitle: work.challenge.title,
      content: work.content,
      createdAt: work.createdAt,
      updatedAt: work.updatedAt,
      likeCount: work.likeCount,
      isLiked: false,
    }));
  }

  // work 생성 및 참여자 추가
  async createWork(challengeId, userId) {
    const result = await this.#prisma.$transaction(async (tx) => {
      const work = await tx.work.create({
        data: {
          challengeId,
          userId,
          content: '',
        },
      });

      await tx.participant.create({
        data: {
          challengeId,
          userId: userId,
        },
      });

      return work;
    });
    return result;
  }

  // 특정 챌린지에서 특정 작업물 조회
  async hasSubmittedWork(challengeId, userId) {
    const work = await this.#prisma.work.findFirst({
      where: { challengeId, userId },
    });
    return work;
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
          select: { id: true, nickname: true, image: true },
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
