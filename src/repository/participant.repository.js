export class ParticipantRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findManyByChallengeId() {}

  findById() {}

  create() {}

  update() {}
}
