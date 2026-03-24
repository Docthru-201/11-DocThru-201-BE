export class ChallengeRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  async findManyWithCursor({ cursor, skip, take, where, orderBy }) {
    const args = {
      where,
      take,
      orderBy: orderBy ?? { createdAt: 'desc' },
    };

    if (cursor && typeof cursor === 'object') {
      args.cursor = cursor;
    }
    if (typeof skip === 'number') {
      args.skip = skip;
    }

    return this.#prisma.challenge.findMany(args);
  }

  // 챌린지 관리 : 관리자 페이지와 일반 사용자 페이지에서 모두 사용 가능합니다.
  async findAllChallenges(options) {
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
  async findChallengeDetailById(challengeId) {
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
  async findChallengeById(challengeId) {
    return await this.#prisma.challenge.findUnique({
      where: { id: challengeId },
      select: {
        id: true,
        authorId: true,
        title: true,
        status: true,
        isClosed: true,
      },
    });
  }

  async create(data) {
    return this.#prisma.challenge.create({ data });
  }

  async update(id, data) {
    return this.#prisma.challenge.update({
      where: { id },
      data,
    });
  }

  // 챌린지 정보 업데이트 (상태 변경, 내용 수정 통합)
  async updateChallengeStatus(challengeId, updateData) {
    return await this.#prisma.challenge.update({
      where: { id: challengeId },
      data: updateData,
    });
  }

  async delete(id) {
    return await this.#prisma.challenge.delete({
      where: { id: id },
    });
  }

  async findByUserId(userId) {
    return await this.#prisma.challenge.findMany({
      where: { authorId: userId },
    });
  }
}
