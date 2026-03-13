import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin } from '#middlewares';
import { signupSchema, loginSchema } from './dto/auth.dto.js';

export class AuthController extends BaseController {
  #authService;
  #cookieProvider;

  constructor({ authService, cookieProvider }) {
    super();
    this.#authService = authService;
    this.#cookieProvider = cookieProvider;
  }

  routes() {
    this.router.post('/signup', validate('body', signupSchema), (req, res) =>
      this.signup(req, res),
    );

    this.router.post('/login', validate('body', loginSchema), (req, res) =>
      this.login(req, res),
    );

    this.router.post('/logout', needsLogin, (req, res) =>
      this.logout(req, res),
    );

    this.router.post('/logout/all', needsLogin, (req, res) =>
      this.logoutAll(req, res),
    );

    this.router.post('/refresh', (req, res) => this.refresh(req, res));

    return this.router;
  }

  async signup(req, res) {
    const user = await this.#authService.signup(req.body);

    res.status(HTTP_STATUS.CREATED).json(user);
  }

  async login(req, res) {
    const { user, accessToken, refreshToken } = await this.#authService.login(
      req.body,
    );
    this.#cookieProvider.setAuthCookies(res, { accessToken, refreshToken });

    res.status(HTTP_STATUS.OK).json(user);
  }

  async logout(req, res) {
    await this.#authService.logout(req.user.id);

    this.#cookieProvider.clearAuthCookies(res);

    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }

  async logoutAll(req, res) {
    await this.#authService.logoutAll(req.user.id);

    this.#cookieProvider.clearAuthCookies(res);

    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }
  async refresh(req, res) {
    // 요청에서 기존 refreshToken 가져오기
    const refreshToken = this.#cookieProvider.getRefreshToken(req);

    // authService를 통해 새로운 토큰 발급
    const { accessToken, refreshToken: newRefreshToken } =
      await this.#authService.refresh(refreshToken);

    // 쿠키에도 토큰 세팅 (원하면)
    this.#cookieProvider.setAuthCookies(res, {
      accessToken,
      refreshToken: newRefreshToken,
    });

    // ✅ HTTP 200 OK + JSON 바디로 새 토큰 반환
    res.status(HTTP_STATUS.OK).json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  }
}
