import { isProduction } from '#config';

/** 로그인 실패·버스트·차단 정책 (운영/개발 완화) */
export const SECURITY_THRESHOLDS = {
  LOGIN_FAIL_WINDOW_MS: 15 * 60 * 1000,
  MAX_FAILS_PER_EMAIL: isProduction ? 7 : 40,
  MAX_FAILS_PER_IP: isProduction ? 25 : 100,
  ACCOUNT_LOCK_DURATION_MS: 30 * 60 * 1000,
  IP_BLOCK_DURATION_MS: 60 * 60 * 1000,
  BURST_WINDOW_MS: 60 * 1000,
  BURST_MAX_REQUESTS_PER_IP: isProduction ? 150 : 3000,
};
