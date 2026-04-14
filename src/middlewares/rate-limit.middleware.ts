import type { Request } from 'express';
import rateLimit from 'express-rate-limit';
import { isProduction } from '#config';

const WINDOW_15M = 15 * 60 * 1000;
const rateLimitMessage = {
  message: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
};

function normalizeBodyEmail(req: Request) {
  const e = req.body?.email;
  if (typeof e === 'string' && e.trim()) {
    return e.trim().toLowerCase();
  }
  return null;
}

/** /api/auth 전체 상한(OAuth·refresh·me 등). 로그인·가입·재설정은 아래 민감 전용 한도가 추가로 적용됨 */
export const authRateLimiter = rateLimit({
  windowMs: WINDOW_15M,
  max: isProduction ? 200 : 3000,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
});

/**
 * 로그인·회원가입·비밀번호 재설정 요청 — IP 기준 (동일 인스턴스를 여러 라우트에 걸면 IP당 공유 카운터)
 */
export const authSensitiveIpLimiter = rateLimit({
  windowMs: WINDOW_15M,
  max: isProduction ? 30 : 400,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip ?? 'unknown',
  message: rateLimitMessage,
});

/**
 * 로그인·회원가입·비밀번호 재설정 요청 — 이메일(계정) 기준. body에 email 없으면 IP로 대체
 */
export const authSensitiveEmailLimiter = rateLimit({
  windowMs: WINDOW_15M,
  max: isProduction ? 10 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = normalizeBodyEmail(req);
    return email ? `email:${email}` : `ip:${req.ip ?? 'unknown'}`;
  },
  message: rateLimitMessage,
});

/** 비밀번호 재설정 확인(token 제출) — IP만 (토큰은 이메일과 분리) */
export const passwordResetConfirmIpLimiter = rateLimit({
  windowMs: WINDOW_15M,
  max: isProduction ? 25 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip ?? 'unknown',
  message: rateLimitMessage,
});

// 나머지 /api 전체 제한
export const apiRateLimiter = rateLimit({
  windowMs: WINDOW_15M,
  max: isProduction ? 600 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.originalUrl.startsWith('/api/auth'),
  message: rateLimitMessage,
});
