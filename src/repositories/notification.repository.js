export class NotificationRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findManyByUserId() {}

  findById() {}

  create() {}

  update() {}

  delete() {}
}
