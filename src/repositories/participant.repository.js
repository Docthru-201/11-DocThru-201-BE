export class ParticipantRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  // 특정 챌린지의 참여자 목록 조회
  async findManyByChallengeId(challengeId) {
    return this.#prisma.participant.findMany({
      where: { challengeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // participant 단건 조회 (PK 기준)
  async findById(id) {
    return this.#prisma.participant.findUnique({
      where: { id },
    });
  }

  // 🔥 핵심: 유저 + 챌린지 기준 참여 여부 확인
  async findByUserAndChallenge(userId, challengeId) {
    return this.#prisma.participant.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId,
        },
      },
    });
  }

  async create(data) {
    return this.#prisma.participant.create({
      data,
    });
  }

  async update(id, data) {
    return this.#prisma.participant.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return this.#prisma.participant.delete({
      where: { id },
    });
  }
}
