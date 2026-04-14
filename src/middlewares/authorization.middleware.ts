import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '#constants';

const createAuthorizationMiddleware = function (
  predicate: (req: Request) => boolean,
  status = HTTP_STATUS.UNAUTHORIZED,
) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (predicate(req)) {
      next();
    } else {
      res.sendStatus(status);
    }
  };
};

const hasLoginUser = (req: Request) => Boolean(req.user);
const hasAdminUser = (req: Request) => req.user?.role === 'ADMIN';

export const needsLogin = createAuthorizationMiddleware(hasLoginUser);
export const needsAdmin = createAuthorizationMiddleware(
  hasAdminUser,
  HTTP_STATUS.FORBIDDEN,
);
