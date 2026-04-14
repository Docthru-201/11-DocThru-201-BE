import type { PrismaClient, Prisma } from '#generated/prisma/client.js';

export class ChallengeRepository {
  #prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.#prisma = prisma;
  }

  // 커서 기반 목록 조회 (무한 스크롤링)
  async findManyWithCursor({
    cursor,
    skip,
    take,
    where,
    orderBy,
    include,
  }: {
    cursor?: Record<string, string>;
    skip?: number;
    take?: number;
    where?: Prisma.ChallengeWhereInput;
    orderBy?: Prisma.ChallengeOrderByWithRelationInput;
    include?: Prisma.ChallengeInclude;
  }) {
    const args: Prisma.ChallengeFindManyArgs = {
      where,
      take,
      orderBy: orderBy ?? { createdAt: 'desc' },
    };

    if (include) {
      args.include = include;
    }
    if (cursor && typeof cursor === 'object') {
      args.cursor = cursor as unknown as Prisma.ChallengeWhereUniqueInput;
    }
    if (typeof skip === 'number') {
      args.skip = skip;
    }

    return this.#prisma.challenge.findMany(args);
  }

  // 챌린지 관리 : 관리자 페이지와 일반 사용자 페이지에서 모두 사용 가능합니다.
  async findAllChallenges(options: {
    skip: number;
    take: number;
    where: Prisma.ChallengeWhereInput;
    orderBy: Prisma.ChallengeOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = options;

    const [data, totalCount] = await Promise.all([
      this.#prisma.challenge.findMany({
        where,
        skip,
        take,
        orderBy: orderBy || [{ createdAt: 'desc' }],
        include: {
          participants: true,
          author: {
            select: { nickname: true, email: true },
          },
        },
      }),
      this.#prisma.challenge.count({ where }),
    ]);

    return {
      challenges: data,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / take),
        currentPage: Math.floor(skip / take) + 1,
        pageSize: take,
      },
    };
  }

  // 챌린지 상세 조회 (이전/다음글 로직 포함)
  async findChallengeDetailById(challengeId: string) {
    const current = await this.#prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        participants: true,
        author: true,
      },
    });

    if (!current) return null;

    // ULID의 사전순 정렬 특성을 이용해 이전/다음글 조회
    const [prev, next] = await Promise.all([
      this.#prisma.challenge.findFirst({
        where: { id: { lt: challengeId } },
        orderBy: { id: 'desc' },
        select: { id: true },
      }),
      this.#prisma.challenge.findFirst({
        where: { id: { gt: challengeId } },
        orderBy: { id: 'asc' },
        select: { id: true },
      }),
    ]);

    return {
      challenge: current,
      prevId: prev?.id || null,
      nextId: next?.id || null,
    };
  }

  // 단순 챌린지 정보 조회 (권한 확인용 등)
  async findChallengeById(challengeId: string) {
    return await this.#prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        author: true,
        participants: true,
      },
    });
  }
  // 공통 사용을 위해서 위의 것으로 대체하였음 : swlee
  // async findChallengeById(challengeId) {
  //   return await this.#prisma.challenge.findUnique({
  //     where: { id: challengeId },
  //     select: {
  //       id: true,
  //       authorId: true,
  //       title: true,
  //       status: true,
  //     },
  //   });
  // }
  async create(data: Prisma.ChallengeCreateInput) {
    return this.#prisma.challenge.create({ data });
  }

  async createParticipant(data: { userId: string; challengeId: string }) {
    return await this.#prisma.participant.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ChallengeUpdateInput) {
    return this.#prisma.challenge.update({
      where: { id },
      data,
    });
  }

  // 챌린지 정보 업데이트 (상태 변경, 내용 수정 통합)
  async updateChallengeStatus(
    challengeId: string,
    data: Prisma.ChallengeUpdateInput,
  ) {
    return await this.#prisma.challenge.update({
      where: { id: challengeId },
      data,
    });
  }

  async delete(id: string) {
    return await this.#prisma.challenge.delete({
      where: { id: id },
    });
  }

  async findByUserId(userId: string) {
    return await this.#prisma.challenge.findMany({
      where: { authorId: userId },
    });
  }

  async findAdminUser() {
    return await this.#prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        role: true,
        email: true,
        nickname: true,
      },
    });
  }

  async findNotificationRecipientsByChallengeId(challengeId: string) {
    return await this.#prisma.challenge.findUnique({
      where: { id: challengeId },
      select: {
        id: true,
        title: true,
        authorId: true,
        participants: {
          select: {
            userId: true,
          },
        },
      },
    });
  }

  async findEndedChallenges(currentTime: Date) {
    return await this.#prisma.challenge.findMany({
      where: {
        isClosed: false,
        deadline: { lte: currentTime },
      },
      include: {
        participants: true,
      },
    });
  }

  async closeChallenge(challengeId: string) {
    return await this.#prisma.challenge.update({
      where: { id: challengeId },
      data: { isClosed: true },
    });
  }

  async findByAuthorIdForMyList(userId: string) {
    return await this.#prisma.challenge.findMany({
      where: { authorId: userId, deletedAt: null },
      include: {
        author: {
          select: { id: true, nickname: true, image: true },
        },
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 나의 챌린지(참가) — Participant 기준 */
  async findByParticipantUserIdForMyList(userId: string) {
    return await this.#prisma.challenge.findMany({
      where: {
        deletedAt: null,
        participants: { some: { userId } },
      },
      include: {
        author: {
          select: { id: true, nickname: true, image: true },
        },
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySubmittedWorkForMyList(
    userId: string,
    { isClosed }: { isClosed?: boolean },
  ) {
    // DB에는 status 컬럼이 있으나, 로컬 generated Prisma Client가 스키마와 어긋난 경우
    // prisma.work.findMany({ where: { status } })가 실패할 수 있어 Raw SQL로 조회합니다.
    // 클라이언트 정합: `pnpm prisma:generate` (DATABASE_URL 설정 후)
    const submitted = await this.#prisma.$queryRaw<{ challengeId: string }[]>`
      SELECT DISTINCT w."challengeId"
      FROM "Work" w
      WHERE w.status = 'SUBMITTED'::"WorkStatus"
        AND (
          w."userId" = ${userId}
          OR EXISTS (
            SELECT 1 FROM "Participant" p
            WHERE p.id = w."participantId" AND p."userId" = ${userId}
          )
        )
    `;
    const challengeIds = [...new Set(submitted.map((row) => row.challengeId))];
    if (challengeIds.length === 0) {
      return [];
    }
    return await this.#prisma.challenge.findMany({
      where: {
        id: { in: challengeIds },
        deletedAt: null,
        isClosed,
      },
      include: {
        author: {
          select: { id: true, nickname: true, image: true },
        },
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
