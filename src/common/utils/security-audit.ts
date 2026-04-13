import pino from 'pino';

const level = process.env.SECURITY_LOG_LEVEL || 'info';

export const securityAuditLogger = pino({
  name: 'security-audit',
  level,
  redact: {
    paths: [
      'password',
      '*.password',
      'token',
      '*.token',
      'refreshToken',
      'accessToken',
      'authorization',
      'req.headers.cookie',
      'headers.cookie',
    ],
    remove: true,
  },
});

export function logSecurityEvent(payload, lvl = 'info') {
  securityAuditLogger[lvl](payload);
}

/**
 * 관리자 알림(현재는 구조화 로그; 이후 웹훅/메일 연동 시 동일 payload 확장)
 */
export function logAdminSecurityAlert(detail) {
  securityAuditLogger.warn({ type: 'admin_security_alert', ...detail });
}
