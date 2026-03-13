export class AuthRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findUserByEmail(email) {
    return this.#prisma.user.findUnique({
      where: { email },
    });
  }

  findUserByNickname(nickname) {
    return this.#prisma.user.findUnique({
      where: { nickname },
    });
  }

  createUser(data) {
    return this.#prisma.user.create({
      data,
    });
  }

  saveRefreshToken(userId, token) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후 만료 예시

    return this.#prisma.refreshToken.upsert({
      where: { userId },
      update: { token, expiresAt },
      create: { userId, token, expiresAt },
    });
  }

  findRefreshToken(userId) {
    return this.#prisma.refreshToken.findUnique({
      where: { userId },
    });
  }

  deleteRefreshToken(userId) {
    return this.#prisma.refreshToken.delete({
      where: { userId },
    });
  }
}
