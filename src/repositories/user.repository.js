export class UserRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

async findUserById(userId) {
  return await this.#prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
}
  findMany() {}

  findById() {}

  findByEmail() {}

  create() {}

  update() {}

  delete() {}
}
