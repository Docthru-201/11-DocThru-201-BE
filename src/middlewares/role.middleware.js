// role.middleware.js

/**
 * Admin 권한 검증 미들웨어
 * AuthMiddleware에서 req.user.role이 세팅되어 있다고 가정
 */
export function adminValidator(req, res, next) {
  //아래 테스트 목적 임시코드
  req.user = {
    userId: '01KMD847HH2DD4M96C8R1TQABX', // 테스트용 ID
    role: 'ADMIN',
  };
  console.log(
    '테스트를 위해 강제 ADMIN부여 user(role.middleware.js)=',
    req.user,
  );
  const role = req.user?.role;

  if (!role) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  if (role !== 'ADMIN') {
    return res.status(403).json({ message: '권한이 없습니다.' });
  }

  next();
}
