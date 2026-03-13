import { prisma } from '#db/prisma.js';
import { UserRepository } from "#repositories";
import { ForbiddenException } from "#exceptions";

// 관리자 검증 함수
const userRepository = new UserRepository({ prisma });

export async function adminValidator(req, res, next) {
  try {

    // const { userId } = req.user;
    const userId = "01KKGAP404XG67S71QNTDEA27D";
    if (!userId) {
      return res.status(401).json({ message: "사용자 ID가 필요합니다." });
    }

    const user = await userRepository.findUserById(userId);

    if (user?.role !== "ADMIN") {
      throw new ForbiddenException();
    }
    req.user = { ...user, userId: user.id };
    next();
  } catch (e) {
    next(e);
  }
}