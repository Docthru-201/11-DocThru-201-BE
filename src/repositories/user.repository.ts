import type { PrismaClient, Prisma } from '#generated/prisma/client.js';

export class UserRepository {
  #prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.#prisma = prisma;
  }

  async findUserById(userId: string) {
    return await this.#prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: true,
      },
    });
  }

  findMany() {}

  findAllUsers() {
    return this.#prisma.user.findMany({
      select: { id: true, nickname: true, image: true },
    });
  }

  findUserByNickname(nickname: string) {
    return this.#prisma.user.findUnique({
      where: { nickname },
    });
  }

  updateUser(id: string, data: Prisma.UserUpdateInput) {
    return this.#prisma.user.update({
      where: { id },
      data,
    });
  }

  deleteUser(id: string) {
    return this.#prisma.user.delete({
      where: { id },
    });
  }
}
