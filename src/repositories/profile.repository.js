export class ProfileRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findByUserId() {}

  upsertByUserId() {}
}
