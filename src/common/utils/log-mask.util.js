const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'refreshToken',
  'accessToken',
  'authorization',
  'code',
  'client_secret',
  'smtpPass',
]);

/**
 * 객체를 로그용으로 복사하며 민감 키는 마스킹 (중첩 1단계)
 */
export function redactForLog(value, depth = 0) {
  if (value == null || depth > 4) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.map((v) => redactForLog(v, depth + 1));
  }
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    const lower = k.toLowerCase();
    if (
      SENSITIVE_KEYS.has(k) ||
      SENSITIVE_KEYS.has(lower) ||
      lower.includes('password') ||
      lower.includes('token') ||
      lower.includes('secret') ||
      lower.includes('authorization')
    ) {
      out[k] = '[REDACTED]';
      continue;
    }
    out[k] =
      v !== null && typeof v === 'object' ? redactForLog(v, depth + 1) : v;
  }
  return out;
}

/** 이메일 로그용 마스킹 (로컬파트 일부만 노출) */
export function maskEmail(email) {
  if (typeof email !== 'string' || !email.includes('@')) return '[invalid]';
  const [local, domain] = email.split('@');
  if (!local || !domain) return '[invalid]';
  const visible = local.length <= 2 ? '*' : `${local.slice(0, 2)}***`;
  return `${visible}@${domain}`;
}

/** 토큰·코드 등 짧은 시크릿 문자열 마스킹 */
export function maskSecretSlice(s, head = 4) {
  if (typeof s !== 'string' || s.length === 0) return '[empty]';
  if (s.length <= head) return '[redacted]';
  return `${s.slice(0, head)}…[len:${s.length}]`;
}
