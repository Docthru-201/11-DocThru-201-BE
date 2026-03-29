import helmet from 'helmet';

/** 충돌이 잦은 CSP와 COEP는 비활성화 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});
