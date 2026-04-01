export class ProfileRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findByUserId(userId) {
    return this.#prisma.profile.findUnique({
      where: { userId },
    });
  }

  create(userId, data) {
    return this.#prisma.profile.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  update(userId, data) {
    return this.#prisma.profile.update({
      where: { userId },
      data,
    });
  }
}
