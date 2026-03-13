export class WorkRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findById() {}

  findManyByChallengeId() {}

  create() {}

  update() {}

  delete() {}
}
