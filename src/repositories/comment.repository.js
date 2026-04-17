export class CommentRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findManyByWorkId() {}

  findById() {}

  create() {}

  update() {}

  delete() {}
}
