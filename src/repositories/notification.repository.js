export class NotificationRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  async findManyByUserId(userId, { skip, take } = {}) {
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

  async findById(id) {
    return await this.#prisma.notification.findUnique({
      where: { id },
    });
  }

  async create(data) {
    return await this.#prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        message: data.message,
        targetId: data.targetId,
        targetUrl: data.targetUrl,
      },
    });
  }

  async update(id, data) {
    return await this.#prisma.notification.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    await this.#prisma.notification.delete({
      where: { id },
    });
  }
}
