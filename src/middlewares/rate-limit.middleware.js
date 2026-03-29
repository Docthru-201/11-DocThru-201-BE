import rateLimit from 'express-rate-limit';
import { isProduction } from '#config';

// /api/auth 제한
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 10 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
});

// 나머지 /api 전체 제한
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 600 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.originalUrl.startsWith('/api/auth'),
  message: { message: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
});
