import type { Request, Response, NextFunction } from 'express';

/** 관리자 전용 라우트: auth 미들웨어 이후 req.user.role === 'ADMIN' 인지 검사 */
export function adminValidator(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const role = req.user?.role;

  if (!role) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  if (role !== 'ADMIN') {
    return res.status(403).json({ message: '권한이 없습니다.' });
  }

  next();
}
