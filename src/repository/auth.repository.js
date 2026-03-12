// src/repositories/AuthRepository.js
export class AuthRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  // 이메일 중복 체크
  existsByEmail(email) {
    return this.#prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  }

  // refresh token 저장
  saveRefreshToken(userId, token) {
    return this.#prisma.refreshToken.upsert({
      where: { userId },
      update: { token },
      create: { userId, token },
    });
  }

  // refresh token 조회
  findRefreshToken(userId) {
    return this.#prisma.refreshToken.findUnique({
      where: { userId },
    });
  }

  // refresh token 삭제 (로그아웃)
  deleteRefreshToken(userId) {
    return this.#prisma.refreshToken.delete({
      where: { userId },
    });
  }
}
