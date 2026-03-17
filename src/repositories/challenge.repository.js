export class ChallengeRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  async findAll(query) {
    // 추후 query 적용
    return await this.#prisma.challenge.findMany({
      where: {},
    });
  }

  async findById(id) {
    return await this.#prisma.challenge.findUnique({
      where: { id },
    });
  }

  async create(data) {
    return await this.#prisma.challenge.create({
      data,
    });
  }

  async update(id, data) {
    return await this.#prisma.challenge.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    await this.#prisma.challenge.delete({
      where: { id },
    });
  }

  async findByAuthor(authorId) {
    return await this.#prisma.challenge.findMany({
      where: { authorId },
    });
  }
}
