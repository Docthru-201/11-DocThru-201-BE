import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin } from '#middlewares';
import {
  signupSchema,
  loginSchema,
  oauthCallbackQuerySchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
} from './dto/auth.dto.js';
import {
  authSensitiveEmailLimiter,
  authSensitiveIpLimiter,
  passwordResetConfirmIpLimiter,
} from '#middlewares';
import { OAUTH_STATE_EXPIRES_MS } from '../../common/constants/auth.js';
import { BadRequestException } from '#exceptions';

export class AuthController extends BaseController {
  #authService;
  #cookieProvider;

  constructor({ authService, cookieProvider }) {
    super();
    this.#authService = authService;
    this.#cookieProvider = cookieProvider;
  }

  routes() {
    this.router.post(
      '/password-reset/request',
      authSensitiveIpLimiter,
      authSensitiveEmailLimiter,
      validate('body', passwordResetRequestSchema),
      (req, res) => this.requestPasswordReset(req, res),
    );
    this.router.post(
      '/password-reset/confirm',
      passwordResetConfirmIpLimiter,
      validate('body', passwordResetConfirmSchema),
      (req, res) => this.confirmPasswordReset(req, res),
    );

    this.router.post(
      '/signup',
      authSensitiveIpLimiter,
      authSensitiveEmailLimiter,
      validate('body', signupSchema),
      (req, res) => this.signup(req, res),
    );

    this.router.post(
      '/login',
      authSensitiveIpLimiter,
      authSensitiveEmailLimiter,
      validate('body', loginSchema),
      (req, res) => this.login(req, res),
    );
    this.router.get('/:provider/login', (req, res) =>
      this.oauthLogin(req, res),
    );

    this.router.get(
      '/:provider/callback',
      validate('query', oauthCallbackQuerySchema),
      (req, res) => this.oauthCallback(req, res),
    );

    this.router.post('/logout', needsLogin, (req, res) =>
      this.logout(req, res),
    );

    this.router.post('/logout/all', needsLogin, (req, res) =>
      this.logoutAll(req, res),
    );

    this.router.post('/refresh', (req, res) => this.refresh(req, res));

    this.router.get('/me', needsLogin, (req, res) => this.me(req, res));

    return this.router;
  }

  async requestPasswordReset(req, res) {
    const body = await this.#authService.requestPasswordReset(req.body, {
      ip: req.ip,
    });
    res.status(HTTP_STATUS.OK).json(body);
  }

  async confirmPasswordReset(req, res) {
    const body = await this.#authService.confirmPasswordReset(req.body, {
      ip: req.ip,
    });
    res.status(HTTP_STATUS.OK).json(body);
  }

  async signup(req, res) {
    const user = await this.#authService.signup(req.body);

    res.status(HTTP_STATUS.CREATED).json(user);
  }

  async login(req, res) {
    const { user, accessToken, refreshToken } = await this.#authService.login(
      req.body,
      { ip: req.ip, userAgent: req.get('user-agent') },
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
    const refreshToken = this.#cookieProvider.getRefreshToken(req);

    const { accessToken, refreshToken: newRefreshToken } =
      await this.#authService.refresh(refreshToken);

    this.#cookieProvider.setAuthCookies(res, {
      accessToken,
      refreshToken: newRefreshToken,
    });

    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }

  async oauthLogin(req, res) {
    const { provider } = req.params;

    const { url, state } = this.#authService.getOAuthLoginUrl(provider);

    res.cookie('oauth_state', state, {
      httpOnly: true,
      maxAge: OAUTH_STATE_EXPIRES_MS,
    });

    return res.redirect(url);
  }
  async oauthCallback(req, res) {
    const { provider } = req.params;
    const { code, state } = req.query;

    const savedState = req.cookies.oauth_state;
    if (!savedState || savedState !== state) {
      throw new BadRequestException('유효하지 않은 요청입니다.');
    }
    res.clearCookie('oauth_state');

    const {
      user: _user,
      accessToken,
      refreshToken,
    } = await this.#authService.oauthLogin(provider, code, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    this.#cookieProvider.setAuthCookies(res, { accessToken, refreshToken });

    const clientBase =
      process.env.CLIENT_BASE_URL?.trim()?.replace(/\/$/, '') ||
      'http://localhost:3000';
    return res.redirect(`${clientBase}/challenges`);
  }

  async me(req, res) {
    const user = await this.#authService.me(req.user.id);
    res.status(HTTP_STATUS.OK).json(user);
  }
}
