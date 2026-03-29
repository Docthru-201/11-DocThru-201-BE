// role.middleware.js — 테스트용: 실제 JWT 없이 관리자 플로우만 확인할 때 사용

const TEST_ADMIN_USER_ID = '01KMHEPW6E308X4KWXJ5JVM66W';

export function adminValidator(req, res, next) {
  req.user = {
    id: TEST_ADMIN_USER_ID,
    userId: TEST_ADMIN_USER_ID,
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
