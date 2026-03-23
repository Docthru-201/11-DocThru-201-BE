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
  findAllUsers() {
    return this.prisma.user.findMany({
      select: { id: true, nickname: true, image: true },
    });
  }

  // findUserById(id) {
  //   return this.prisma.user.findUnique({ where: { id } });
  // }

  findUserByNickname(nickname) {
    return this.prisma.user.findUnique({
      where: { nickname },
    });
  }

  updateUser(id, data) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  deleteUser(id) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
