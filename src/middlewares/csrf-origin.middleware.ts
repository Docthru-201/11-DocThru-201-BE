import type { Request, Response, NextFunction } from 'express';
import { corsOrigins, isDevelopment, isProduction, isTest } from '#config';
import { ERROR_MESSAGE } from '#constants';
import { ForbiddenException } from '#exceptions';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function hasAuthCookie(req: Request) {
  return Boolean(req.cookies?.accessToken || req.cookies?.refreshToken);
}

function originAllowed(origin: string | undefined) {
  return Boolean(origin && corsOrigins.includes(origin));
}

function refererOriginAllowed(referer: string | undefined) {
  if (!referer) return false;
  try {
    const u = new URL(referer);
    return corsOrigins.includes(u.origin);
  } catch {
    return false;
  }
}

/**
 * 쿠키 기반 세션( access/refresh )이 실린 상태 변경 요청에 대해
 * Origin 또는 Referer가 CORS 허용 목록과 일치하는지 검사.
 * 개발 환경에서는 적용 X
 */
export function csrfOriginMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    if (!UNSAFE_METHODS.has(req.method)) {
      return next();
    }

    if (!req.path.startsWith('/api')) {
      return next();
    }

    if (isDevelopment || isTest) {
      return next();
    }

    if (!hasAuthCookie(req)) {
      return next();
    }

    if (isProduction && corsOrigins.length === 0) {
      throw new ForbiddenException(ERROR_MESSAGE.CSRF_CORS_NOT_CONFIGURED);
    }

    const origin = req.get('Origin');
    if (originAllowed(origin)) {
      return next();
    }

    if (!origin && refererOriginAllowed(req.get('Referer'))) {
      return next();
    }

    throw new ForbiddenException(ERROR_MESSAGE.CSRF_ORIGIN_INVALID);
  } catch (err) {
    next(err);
  }
}
