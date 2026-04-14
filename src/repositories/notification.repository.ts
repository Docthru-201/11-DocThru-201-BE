import type { PrismaClient, Prisma } from '#generated/prisma/client.js';

export class NotificationRepository {
  #prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.#prisma = prisma;
  }

  async findManyByUserId(
    userId: string,
    { skip, take }: { skip?: number; take?: number } = {},
  ) {
    return await this.#prisma.notification.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return await this.#prisma.notification.findUnique({
      where: { id },
    });
  }

  async create(data: {
    userId: string;
    type?: string;
    message?: string;
    targetId?: string;
    targetUrl?: string;
  }) {
    return await this.#prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as Prisma.NotificationCreateInput['type'],
        message: data.message,
        targetId: data.targetId,
        targetUrl: data.targetUrl,
      },
    });
  }

  async update(id: string, data: Prisma.NotificationUpdateInput) {
    return await this.#prisma.notification.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.#prisma.notification.delete({
      where: { id },
    });
  }
}
