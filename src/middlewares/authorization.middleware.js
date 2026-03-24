import { HTTP_STATUS } from '#constants';

const createAuthorizationMiddleware = function (
  predicate,
  status = HTTP_STATUS.UNAUTHORIZED,
) {
  return function (req, res, next) {
    // ← 미들웨어 함수 반환
    if (predicate(req)) {
      next(); // 조건 통과 → 다음으로
    } else {
      res.sendStatus(status); // 조건 실패 → 에러 반환
    }
  };
};

const hasLoginUser = (req) => Boolean(req.user);
const hasAdminUser = (req) => req.user?.role === 'ADMIN';

export const needsLogin = createAuthorizationMiddleware(hasLoginUser);
export const needsAdmin = createAuthorizationMiddleware(
  hasAdminUser,
  HTTP_STATUS.FORBIDDEN,
);
