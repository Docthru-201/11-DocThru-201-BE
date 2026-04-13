import { config, isProduction } from '#config';

/**
 * 프로덕션 환경 + FORCE_HTTPS=true 일 때만 사용.
 * TLS 종료가 프록시에 있으면 TRUST_PROXY를 설정해야 X-Forwarded-Proto가 반영됨.
 */
export function httpsRedirectMiddleware(req, res, next) {
  if (!isProduction || config.FORCE_HTTPS !== 'true') {
    return next();
  }
  const forwarded = req.headers['x-forwarded-proto'];
  if (req.secure || forwarded === 'https') {
    return next();
  }
  const host = req.get('host') || '';
  return res.redirect(301, `https://${host}${req.originalUrl}`);
}
