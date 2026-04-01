import { HTTP_STATUS } from '#constants';

const createAuthorizationMiddleware = function (
  predicate,
  status = HTTP_STATUS.UNAUTHORIZED,
) {
  return function (req, res, next) {
    if (predicate(req)) {
      next();
    } else {
      res.sendStatus(status);
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
