import { SECURITY_THRESHOLDS } from '../constants/security.js';
import {
  logAdminSecurityAlert,
  logSecurityEvent,
} from '../utils/security-audit.js';
import { maskEmail } from '../utils/log-mask.util.js';

function now() {
  return Date.now();
}

function normalizeIp(ip) {
  return ip || 'unknown';
}

function emailCounterKey(emailNormalized) {
  return `e:${emailNormalized}`;
}

function ipCounterKey(ip) {
  return `ip:${normalizeIp(ip)}`;
}

function loginTargetKey(emailNormalized, ip) {
  return emailNormalized ? emailCounterKey(emailNormalized) : ipCounterKey(ip);
}

function formatUaSample(value) {
  if (!value) return '(empty)';
  return value.length > 80 ? `${value.slice(0, 80)}…` : value;
}

function pruneExpiredIpBlocks(map) {
  const t = now();
  for (const [key, value] of map) {
    if (!value || value.until <= t) {
      map.delete(key);
    }
  }
}

function pruneBurstMap(map, windowMs) {
  const t = now();
  for (const [key, value] of map) {
    if (!value || t - value.windowStart >= windowMs) {
      map.delete(key);
    }
  }
}

// 고정 window 카운터
class FixedWindowCounter {
  #map = new Map();

  increment(key, windowMs) {
    const t = now();
    const current = this.#map.get(key);

    // window가 끝났으면 새 창 시작
    if (!current || t - current.windowStart >= windowMs) {
      this.#map.set(key, {
        count: 1,
        windowStart: t,
        lastSeen: t,
      });
      return 1;
    }

    current.count += 1;
    current.lastSeen = t;
    return current.count;
  }

  reset(key) {
    this.#map.delete(key);
  }

  pruneInactive(maxAgeMs) {
    const t = now();
    for (const [key, value] of this.#map) {
      if (!value || t - value.lastSeen >= maxAgeMs) {
        this.#map.delete(key);
      }
    }
  }
}

const emailFails = new FixedWindowCounter();
const ipFails = new FixedWindowCounter();
const ipBlocks = new Map();
const burstByIp = new Map();

const SUSPICIOUS_UA = /sqlmap|nikto|masscan|nmap|acunetix|nessus|scanner/i;

class SecurityDefense {
  // 메모리성 상태 주기 정리
  #pruneTransientState() {
    const { LOGIN_FAIL_WINDOW_MS, BURST_WINDOW_MS } = SECURITY_THRESHOLDS;

    emailFails.pruneInactive(LOGIN_FAIL_WINDOW_MS);
    ipFails.pruneInactive(LOGIN_FAIL_WINDOW_MS);
    pruneExpiredIpBlocks(ipBlocks);
    pruneBurstMap(burstByIp, BURST_WINDOW_MS);
  }

  isIpBlocked(ip) {
    this.#pruneTransientState();

    const key = normalizeIp(ip);
    const row = ipBlocks.get(key);

    return Boolean(row && row.until > now());
  }

  blockIp(ip, durationMs, reason) {
    const key = normalizeIp(ip);
    const until = now() + durationMs;

    ipBlocks.set(key, { until, reason });

    logAdminSecurityAlert({
      reason: 'ip_blocked',
      detail: reason,
      ip: key,
      until: new Date(until).toISOString(),
    });

    logSecurityEvent({
      type: 'security_ip_blocked',
      ip: key,
      until: new Date(until).toISOString(),
      reason,
    });

    return new Date(until);
  }

  recordRequestBurst(ip) {
    this.#pruneTransientState();

    const key = normalizeIp(ip);
    const t = now();
    const { BURST_WINDOW_MS, BURST_MAX_REQUESTS_PER_IP } = SECURITY_THRESHOLDS;

    let row = burstByIp.get(key);

    if (!row || t - row.windowStart >= BURST_WINDOW_MS) {
      row = { count: 0, windowStart: t };
      burstByIp.set(key, row);
    }

    row.count += 1;

    // 임계치 처음 초과한 시점만 로그
    if (row.count === BURST_MAX_REQUESTS_PER_IP + 1) {
      logSecurityEvent({
        type: 'security_burst_threshold',
        ip: key,
        count: row.count,
        windowMs: BURST_WINDOW_MS,
      });

      logAdminSecurityAlert({
        reason: 'burst_threshold',
        ip: key,
        count: row.count,
        windowMs: BURST_WINDOW_MS,
      });
    }

    return row.count;
  }

  logSuspiciousUserAgent(ip, ua) {
    const ipKey = normalizeIp(ip);
    const raw = typeof ua === 'string' ? ua : '';
    const trimmed = raw.trim();

    // 비정상 UA 패턴 또는 지나치게 짧은 UA 탐지
    if (!trimmed || trimmed.length < 6 || SUSPICIOUS_UA.test(trimmed)) {
      logSecurityEvent({
        type: 'security_suspicious_user_agent',
        ip: ipKey,
        uaLength: trimmed.length,
        uaSample: formatUaSample(trimmed),
      });
    }
  }

  recordLoginFailure({ ip, emailNormalized, userId }) {
    this.#pruneTransientState();

    const {
      LOGIN_FAIL_WINDOW_MS,
      MAX_FAILS_PER_EMAIL,
      MAX_FAILS_PER_IP,
      ACCOUNT_LOCK_DURATION_MS,
      IP_BLOCK_DURATION_MS,
    } = SECURITY_THRESHOLDS;

    const ipKey = normalizeIp(ip);
    const maskedEmail = emailNormalized ? maskEmail(emailNormalized) : null;

    const emailKey = loginTargetKey(emailNormalized, ipKey);
    const ipKeyForCounter = ipCounterKey(ipKey);

    const emailCount = emailFails.increment(emailKey, LOGIN_FAIL_WINDOW_MS);
    const ipCount = ipFails.increment(ipKeyForCounter, LOGIN_FAIL_WINDOW_MS);

    logSecurityEvent({
      type: 'login_failure',
      ip: ipKey,
      emailMasked: maskedEmail,
      emailFailCount: emailCount,
      ipFailCount: ipCount,
    });

    let lockUntil = null;
    let blockedUntil = null;

    if (userId && emailCount >= MAX_FAILS_PER_EMAIL) {
      lockUntil = new Date(now() + ACCOUNT_LOCK_DURATION_MS);

      // 같은 계정에 대한 window 카운트 초기화
      emailFails.reset(emailKey);

      logAdminSecurityAlert({
        reason: 'account_login_locked',
        userId,
        emailMasked: maskedEmail,
        failCount: emailCount,
        lockUntil: lockUntil.toISOString(),
      });

      logSecurityEvent({
        type: 'account_login_locked',
        userId,
        emailMasked: maskedEmail,
        lockUntil: lockUntil.toISOString(),
      });

      // 여기서 실제 잠금이 적용 X -> lock util에서 진행
    }

    if (ipCount >= MAX_FAILS_PER_IP) {
      blockedUntil = this.blockIp(
        ipKey,
        IP_BLOCK_DURATION_MS,
        'login_failures_ip_threshold',
      );

      // IP 차단 후 카운트 초기화
      ipFails.reset(ipKeyForCounter);
    }

    return { lockUntil, blockedUntil };
  }

  clearLoginFailuresForEmail(emailNormalized) {
    if (!emailNormalized) return;
    emailFails.reset(emailCounterKey(emailNormalized));
  }

  clearLoginFailuresForIp(ip) {
    ipFails.reset(ipCounterKey(ip));
  }

  oauthFailure(ip, message) {
    logSecurityEvent({
      type: 'oauth_login_failure',
      ip: normalizeIp(ip),
      message: String(message).slice(0, 200),
    });
  }

  oauthSuccess(ip, userId) {
    logSecurityEvent({
      type: 'oauth_login_success',
      ip: normalizeIp(ip),
      userId,
    });
  }
}

export const securityDefense = new SecurityDefense();
