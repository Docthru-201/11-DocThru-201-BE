// src/repositories/ProfileRepository.js
export class ProfileRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  // 프로필 조회
  findByUserId(userId) {
    return this.#prisma.profile.findUnique({
      where: { userId },
    });
  }

  // 프로필 생성
  create(userId, data) {
    // data: { nickname?, bio?, imageUrl? }
    return this.#prisma.profile.create({
      data: { userId, ...data },
    });
  }

  // 프로필 업데이트
  update(userId, data) {
    // data: { nickname?, bio?, imageUrl? }
    return this.#prisma.profile.update({
      where: { userId },
      data,
    });
  }

  // 프로필 삭제
  delete(userId) {
    return this.#prisma.profile.delete({
      where: { userId },
    });
  }
}
