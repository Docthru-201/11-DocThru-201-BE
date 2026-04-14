import type { PrismaClient, Prisma } from '#generated/prisma/client.js';

export class ParticipantRepository {
  #prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.#prisma = prisma;
  }

  async findManyByChallengeId(challengeId: string) {
    return this.#prisma.participant.findMany({
      where: { challengeId },
      orderBy: { joinedAt: 'desc' },
    });
  }
  async findById(id: string) {
    return this.#prisma.participant.findUnique({
      where: { id },
    });
  }

  async findByUserAndChallenge(userId: string, challengeId: string) {
    return this.#prisma.participant.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId,
        },
      },
    });
  }

  async create(data: { userId: string; challengeId: string }) {
    return this.#prisma.participant.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ParticipantUpdateInput) {
    return this.#prisma.participant.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.#prisma.participant.delete({
      where: { id },
    });
  }

  async deleteByUserAndChallenge(userId: string, challengeId: string) {
    return this.#prisma.participant.deleteMany({
      where: {
        userId,
        challengeId,
      },
    });
  }
  async countByUserId(userId: string) {
    return this.#prisma.participant.count({
      where: { userId },
    });
  }
}
