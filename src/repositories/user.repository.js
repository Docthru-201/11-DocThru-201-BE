export class UserRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findMany() {}

  findById() {}

  findByEmail() {}

  create() {}

  update() {}

  delete() {}
}
