import { ERROR_MESSAGE } from '#constants';
import { ForbiddenException } from '#exceptions';

/** JWT·req.user 기준 관리자 여부 */
export function isAdmin(user) {
  return user?.role === 'ADMIN';
}

/**
 * 관리자 전용 서비스/라우트에서 호출. 라우트 미들웨어와 별개로 서버 측 재검증용.
 */
export function requireAdmin(user) {
  if (!isAdmin(user)) {
    throw new ForbiddenException(ERROR_MESSAGE.ADMIN_ONLY_ACCESS);
  }
}
