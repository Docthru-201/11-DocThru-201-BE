export class ChallengeRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  async findMany(query) {
    //나중에 pagination 조건넣기
    return await this.#prisma.challenge.findMany();
  }

  async findById(id) {
    return await this.#prisma.challenge.findUnique({ where: { id } });
  }

  async create(data) {
    return await this.#prisma.challenge.create({ data });
  }

  async update(id, updateData) {
    return await this.#prisma.challenge.update({
      where: { id: id },
      data: updateData,
    });
  }

  async delete(id) {
    return await this.#prisma.challenge.delete({
      where: { id: id },
    });
  }

  async findByUserId(userId) {
    return await this.#prisma.challenge.findMany({
      where: { authorId: userId },
    });
  }
}
