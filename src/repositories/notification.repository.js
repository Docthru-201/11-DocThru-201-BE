export class NotificationRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findManyByUserId() {}

  findById() {}

  async create(data) {
    return await this.#prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        targetId: data.targetId,
        targetUrl: data.targetUrl,
      },
    });
  }

  update() {}

  delete() {}
}
