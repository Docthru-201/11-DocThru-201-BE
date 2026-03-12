export class UsersRepository {
  constructor({ prisma }) {
    this.prisma = prisma; // Prisma DB 인스턴스
  }

  // 1️⃣ 전체 유저 조회
  findAllUsers() {
    return this.prisma.user.findMany({
      select: { id: true, nickname: true, image: true },
    });
  }

  // 2️⃣ ID로 유저 조회
  findUserById(id) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // 3️⃣ 유저 정보 수정
  updateUser(id, data) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // 4️⃣ 유저 삭제
  deleteUser(id) {
    return this.prisma.user.delete({ where: { id } });
  }

  // 5️⃣ 이메일로 유저 조회 (추후 필요시)
  findUserByEmail(email) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
