// src/repositories/UserRepository.js
export class UserRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  // 모든 유저 조회
  findAll() {
    return this.#prisma.user.findMany({
      select: { id: true, email: true, nickname: true, createdAt: true },
    });
  }

  // ID로 유저 조회
  findById(id) {
    return this.#prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, email: true, nickname: true, createdAt: true },
    });
  }

  // 이메일로 유저 조회 (로그인용)
  findByEmail(email) {
    return this.#prisma.user.findUnique({
      where: { email },
    });
  }

  // 유저 생성
  create(data) {
    // data: { email, nickname, password }
    return this.#prisma.user.create({
      data,
      select: { id: true, email: true, nickname: true, createdAt: true },
    });
  }

  // 유저 업데이트
  update(id, data) {
    // data: { nickname?, password? }
    return this.#prisma.user.update({
      where: { id: Number(id) },
      data,
      select: { id: true, email: true, nickname: true, createdAt: true },
    });
  }

  // 유저 삭제
  delete(id) {
    return this.#prisma.user.delete({
      where: { id: Number(id) },
    });
  }
}
