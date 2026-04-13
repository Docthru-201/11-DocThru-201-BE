import { ERROR_MESSAGE } from '#constants';
import { ForbiddenException } from '#exceptions';
import { securityDefense } from '../common/security/defense.js';
import { logSecurityEvent } from '../common/utils/security-audit.js';

export function securityIpBlockGuard(req, _res, next) {
  const ip = req.ip ?? 'unknown';
  if (securityDefense.isIpBlocked(ip)) {
    logSecurityEvent({
      type: 'request_blocked_ip',
      ip,
      path: req.originalUrl,
    });
    return next(
      new ForbiddenException(ERROR_MESSAGE.ACCESS_TEMPORARILY_BLOCKED),
    );
  }
  next();
}

export function securityObserveRequest(req, _res, next) {
  const ip = req.ip ?? 'unknown';
  securityDefense.recordRequestBurst(ip);
  securityDefense.logSuspiciousUserAgent(ip, req.get('user-agent'));
  next();
}

/**
 * 관리자 전용 동작 감사(응답 완료 후 1회 기록)
 */
export function auditAdminAction(req, res, next) {
  const userId = req.user?.id ?? req.user?.userId;
  const role = req.user?.role;
  res.on('finish', () => {
    if (!userId || role !== 'ADMIN') return;
    logSecurityEvent({
      type: 'admin_action',
      userId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      ip: req.ip ?? 'unknown',
    });
  });
  next();
}
