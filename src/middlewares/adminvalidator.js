import { prisma } from '#db/prisma.js';
import { UserRepository } from '#repositories';
import { ForbiddenException } from '#exceptions';

// 관리자 검증 함수
const userRepository = new UserRepository({ prisma });

export async function tempadminValidator(req, res, next) {
  // const { userId } = req.user;
  console.log('임시userId(adminvalidator.js):01KM8JWERCM7X65PGFGTSQDEFC');
  const userId = '01KM8JWERCM7X65PGFGTSQDEFC';
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
