import type { PrismaClient, Prisma } from '#generated/prisma/client.js';

export class WorkRepository {
  #prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.#prisma = prisma;
  }

  async findById(id: string) {
    return this.#prisma.work.findUnique({
      where: { id },
    });
  }

  //현재 챌린지의 모든 work 조회 (SUBMITTED만 반환)
  async findManyByChallengeId(
    challengeId: string,
    page: number,
    pageSize: number,
  ) {
    const works = await this.#prisma.work.findMany({
      where: { challengeId, status: 'SUBMITTED' },
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
            image: true,
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
        authorId: work.user!.id,
        authorNickname: work.user!.nickname,
        grade: work.user!.grade,
        image: work.user!.image,
      },
      challengeId: work.challengeId,
      challengeTitle: work.challenge.title,
      title: work.title,
      content: work.content,
      status: work.status,
      submittedAt: work.submittedAt,
      createdAt: work.createdAt,
      updatedAt: work.updatedAt,
      likeCount: work.likeCount,
      isLiked: false,
    }));
  }

  // 본인 work 조회 (DRAFT 포함)
  async findMyWorkByChallengeId(challengeId: string, userId: string) {
    return this.#prisma.work.findFirst({
      where: { challengeId, userId },
      include: {
        user: {
          select: { id: true, nickname: true, image: true },
        },
        challenge: {
          select: { title: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });
  }

  // work 생성 및 참여자 추가
  async createWork(challengeId: string, userId: string) {
    const result = await this.#prisma.$transaction(async (tx) => {
      const participant = await tx.participant.upsert({
        where: {
          challengeId_userId: { challengeId, userId },
        },
        create: { challengeId, userId },
        update: {},
      });

      const work = await tx.work.create({
        data: {
          challengeId,
          participantId: participant.id,
          userId: userId,
          content: '',
        },
      });

      return work;
    });

    return result;
  }
  // 특정 챌린지에서 특정 작업물 조회
  async hasSubmittedWork(challengeId: string, userId: string) {
    const work = await this.#prisma.work.findFirst({
      where: { challengeId, userId },
    });
    return work;
  }

  // 이미 제출한 작업물이 있는지 확인 (참여자 1명당 작업물 1개 제한)
  async findWorkByParticipant(participantId: string) {
    return this.#prisma.work.findUnique({
      where: { participantId },
    });
  }

  async findByIdWithDetail(id: string) {
    return this.#prisma.work.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, nickname: true, image: true },
        },
        challenge: {
          select: {
            title: true,
            category: true,
            type: true,
            originalUrl: true,
          },
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

  async create(data: Prisma.WorkCreateInput) {
    return this.#prisma.work.create({ data });
  }

  async update(id: string, data: Prisma.WorkUpdateInput) {
    return this.#prisma.work.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.#prisma.work.delete({
      where: { id },
    });
  }

  async countByUserId(userId: string) {
    return this.#prisma.work.count({
      where: { userId },
    });
  }

  /** 본인 작업물에 표시된 좋아요 수 합계(Work.likeCount 기준) */
  async sumLikeCountByUserId(userId: string) {
    const agg = await this.#prisma.work.aggregate({
      where: { userId },
      _sum: { likeCount: true },
    });
    return agg._sum.likeCount ?? 0;
  }

  async findManyByUserId(userId: string) {
    return this.#prisma.work.findMany({
      where: { userId },
      include: {
        challenge: {
          select: { id: true, title: true, category: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
