export class ParticipantRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  async findManyByChallengeId(challengeId) {
    return this.#prisma.participant.findMany({
      where: { challengeId },
      orderBy: { createdAt: 'desc' },
    });
  }
  async findById(id) {
    return this.#prisma.participant.findUnique({
      where: { id },
    });
  }

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
