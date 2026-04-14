import type { PrismaClient, Prisma } from '#generated/prisma/client.js';

export class ProfileRepository {
  #prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.#prisma = prisma;
  }

  findByUserId(userId: string) {
    return this.#prisma.profile.findUnique({
      where: { userId },
    });
  }

  create(userId: string, data: Prisma.ProfileCreateWithoutUserInput) {
    return this.#prisma.profile.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  update(userId: string, data: Prisma.ProfileUpdateInput) {
    return this.#prisma.profile.update({
      where: { userId },
      data,
    });
  }
}
