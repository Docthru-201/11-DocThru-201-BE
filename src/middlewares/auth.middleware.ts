export class AuthMiddleware {
  #tokenProvider;
  #authService;
  #cookieProvider;

  constructor({ tokenProvider, authService, cookieProvider }) {
    this.#tokenProvider = tokenProvider;
    this.#authService = authService;
    this.#cookieProvider = cookieProvider;
  }

  async authenticate(req, res, next) {
    try {
      const { accessToken, refreshToken } = req.cookies;

      if (!accessToken && !refreshToken) {
        return next();
      }

      const accessPayload = accessToken
        ? this.#tokenProvider.verifyAccessToken(accessToken)
        : null;

      if (accessPayload?.userId) {
        req.user = {
          id: accessPayload.userId,
          role: accessPayload.role,
          nickname: accessPayload.nickname,
        };

        return next();
      }

      if (!refreshToken) {
        this.#cookieProvider.clearAuthCookies(res);
        return next();
      }

      const { user, tokens } = await this.#authService.refresh(refreshToken);

      this.#cookieProvider.setAuthCookies(res, tokens);
      req.user = {
        id: user.id,
        role: user.role,
        nickname: user.nickname,
      };

      return next();
    } catch {
      this.#cookieProvider.clearAuthCookies(res);
      return next();
    }
  }
}
