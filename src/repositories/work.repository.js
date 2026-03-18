export class WorkRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findById() {}

//현재 챌린지의 모든 work 조회-swlee
async findManyByChallengeId (challengeId, page, pageSize) {
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
      likeCount: "desc",
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
};

  create() {}

  update() {}

  delete() {}
}
