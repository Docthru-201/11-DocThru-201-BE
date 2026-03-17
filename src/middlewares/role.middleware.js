// role.middleware.js

/**
 * Admin 권한 검증 미들웨어
 * AuthMiddleware에서 req.user.role이 세팅되어 있다고 가정
 */
export function adminValidator(req, res, next) {
  const role = req.user?.role;

  if (!role) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  if (role !== 'ADMIN') {
    return res.status(403).json({ message: '권한이 없습니다.' });
  }

  next();
}
