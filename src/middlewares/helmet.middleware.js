import helmet from 'helmet';

/** Swagger UI는 인라인 스크립트 등으로 엄격 CSP와 충돌하므로 완화 */
const helmetSwagger = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

const helmetApi = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      baseUri: ["'none'"],
      formAction: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/** 충돌이 잦은 CSP와 COEP는 비활성화 */
export function helmetMiddleware(req, res, next) {
  if (req.path.startsWith('/api-docs')) {
    return helmetSwagger(req, res, next);
  }
  return helmetApi(req, res, next);
}
