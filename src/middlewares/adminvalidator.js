import { prisma } from '#db/prisma.js';
import { UserRepository } from '#repositories';
import { ForbiddenException } from '#exceptions';

// 관리자 검증 함수
const userRepository = new UserRepository({ prisma });

export async function adminValidator(req, res, next) {
  // const { userId } = req.user;
  console.log('임시userId:01KKXB2DAMEP2E0EWG1JYCRZEZ');
  const userId = '01KKXB2DAMEP2E0EWG1JYCRZEZ';
  if (!userId) {
    return res.status(401).json({ message: '사용자 ID가 필요합니다.' });
  }

  const user = await userRepository.findUserById(userId);

  if (user?.role !== 'ADMIN') {
    throw new ForbiddenException();
  }
  req.user = { ...user, userId: user.id };
  next();
}
