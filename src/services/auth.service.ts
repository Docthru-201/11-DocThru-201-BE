import { createHash, randomBytes } from 'node:crypto';
import { ulid } from 'ulid';
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '#constants';
import { PASSWORD_RESET_TOKEN_EXPIRES_MS } from '../common/constants/auth.js';
import { sendPasswordResetEmail } from '#providers';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '#exceptions';
import { securityDefense } from '../common/security/defense.js';
import { logSecurityEvent } from '../common/utils/security-audit.js';
import { maskEmail } from '../common/utils/log-mask.util.js';
import type { AuthRepository } from '#repositories';
import type { PasswordProvider, TokenProvider } from '#providers';

function buildPasswordResetLink(rawToken: string) {
  const base =
    process.env.CLIENT_BASE_URL?.trim()?.replace(/\/$/, '') ||
    'http://localhost:3000';
  const pathSeg =
    process.env.PASSWORD_RESET_CLIENT_PATH?.trim() || '/reset-password';
  const path = pathSeg.startsWith('/') ? pathSeg : `/${pathSeg}`;
  return `${base}${path}?token=${encodeURIComponent(rawToken)}`;
}

export class AuthService {
  #authRepository: AuthRepository;
  #passwordProvider: PasswordProvider;
  #tokenProvider: TokenProvider;

  constructor({
    authRepository,
    passwordProvider,
    tokenProvider,
  }: {
    authRepository: AuthRepository;
    passwordProvider: PasswordProvider;
    tokenProvider: TokenProvider;
  }) {
    this.#authRepository = authRepository;
    this.#passwordProvider = passwordProvider;
    this.#tokenProvider = tokenProvider;
  }

  #toAuthUserResponse(user: Record<string, unknown> | null | undefined) {
    if (!user) return user;
    const { password: _pw, socials, ...rest } = user;
    return {
      ...rest,
      hasGoogleAccount: Array.isArray(socials) && socials.length > 0,
    };
  }

  async signup(data: { email: string; nickname: string; password: string }) {
    const { email, nickname, password } = data;

    // 1. 이메일/닉네임 중복 확인
    const existEmail = await this.#authRepository.findUserByEmail(email);
    if (existEmail) {
      throw new ConflictException(ERROR_MESSAGE.EMAIL_ALREADY_EXISTS);
    }

    const existNickname =
      await this.#authRepository.findUserByNickname(nickname);
    if (existNickname) {
      throw new ConflictException(ERROR_MESSAGE.NICKNAME_ALREADY_EXISTS);
    }

    // 2. 비밀번호 해싱 (PasswordProvider의 hash 사용)
    const hashedPassword = await this.#passwordProvider.hash(password);

    // 3. 유저 생성
    const user = await this.#authRepository.createUser({
      email,
      nickname,
      password: hashedPassword,
    });

    // 4. 비밀번호 제거 후 반환
    const { password: _pw, ...userWithoutPassword } = user;
    return this.#toAuthUserResponse({ ...userWithoutPassword, socials: [] });
  }

  async login(
    data: { email: string; password: string },
    requestContext: { ip?: string; userAgent?: string } = {},
  ) {
    const { email, password } = data;
    const ip = requestContext.ip ?? 'unknown';
    const emailNorm =
      typeof email === 'string' ? email.trim().toLowerCase() : '';

    // 1. 유저 존재 확인
    const user = await this.#authRepository.findUserByEmail(email);
    if (
      user?.loginLockedUntil &&
      user.loginLockedUntil.getTime() > Date.now()
    ) {
      logSecurityEvent({
        type: 'login_blocked_account_locked',
        ip,
        userId: user.id,
        emailMasked: maskEmail(emailNorm || email || ''),
      });
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_LOGIN);
    }

    if (!user) {
      securityDefense.recordLoginFailure({
        ip,
        emailNormalized: emailNorm || null,
        userId: null,
      });
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_LOGIN);
    }

    if (user.password == null || user.password === '') {
      securityDefense.recordLoginFailure({
        ip,
        emailNormalized: emailNorm || user.email,
        userId: user.id,
      });
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_LOGIN);
    }

    // 2. 비밀번호 검증 (PasswordProvider의 compare 사용)
    const isMatch = await this.#passwordProvider.compare(
      password,
      user.password,
    );
    if (!isMatch) {
      const { lockUntil } = securityDefense.recordLoginFailure({
        ip,
        emailNormalized: emailNorm || user.email,
        userId: user.id,
      });
      if (lockUntil) {
        await this.#authRepository.setUserLoginLockedUntil(user.id, lockUntil);
      }
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_LOGIN);
    }

    securityDefense.clearLoginFailuresForEmail(emailNorm || user.email);

    // 3. 세션 고정 방지: 기존 refresh(서버 저장) 무효화 후 새 토큰 쌍 발급
    await this.#authRepository.deleteRefreshToken(user.id);

    const accessToken = this.#tokenProvider.generateAccessToken(user);
    const refreshToken = this.#tokenProvider.generateRefreshToken(user);

    await this.#authRepository.saveRefreshToken(user.id, refreshToken);

    logSecurityEvent({
      type: 'login_success',
      ip,
      userId: user.id,
      emailMasked: maskEmail(user.email),
    });

    const { password: _pw, ...userWithoutPassword } = user;
    return {
      user: this.#toAuthUserResponse(userWithoutPassword),
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string) {
    await this.#authRepository.deleteRefreshToken(userId);
  }

  async logoutAll(userId: string) {
    await this.#authRepository.deleteRefreshToken(userId);
  }

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_TOKEN);
    }

    const payload = this.#tokenProvider.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_TOKEN);
    }

    const savedToken = await this.#authRepository.findRefreshToken(
      payload.userId,
    );

    if (!savedToken || savedToken.token !== refreshToken) {
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_TOKEN);
    }

    const user = await this.#authRepository.findUserById(payload.userId);
    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    // refresh 로테이션: 기존 토큰 행을 지우고 새 refresh만 유효(세션 식별자 교체)
    await this.#authRepository.deleteRefreshToken(payload.userId);

    const newAccessToken = this.#tokenProvider.generateAccessToken(user);
    const newRefreshToken = this.#tokenProvider.generateRefreshToken(user);

    await this.#authRepository.saveRefreshToken(
      payload.userId,
      newRefreshToken,
    );
    return {
      user,
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };
  }
  getOAuthLoginUrl(provider: string) {
    if (provider === 'google') {
      const CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim();
      const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI?.trim();
      if (!CLIENT_ID) {
        throw new BadRequestException(
          'Google OAuth: GOOGLE_CLIENT_ID가 비어 있습니다. .env에 클라이언트 ID를 넣고 서버를 재시작하세요.',
        );
      }
      if (!REDIRECT_URI) {
        throw new BadRequestException(
          'Google OAuth: GOOGLE_REDIRECT_URI가 비어 있습니다. Google Cloud 콘솔에 등록한 리디렉션 URI와 동일한 값을 .env에 설정하세요.',
        );
      }
      const state = ulid();

      return {
        url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent('email profile')}&state=${state}`,
        state,
      };
    }
    throw new BadRequestException(`지원하지 않는 provider입니다: ${provider}`);
  }
  async oauthLogin(
    provider: string,
    code: string,
    requestContext: { ip?: string; userAgent?: string } = {},
  ) {
    const ip = requestContext.ip ?? 'unknown';
    if (provider === 'google') {
      let googleUser;
      try {
        googleUser = await this.#authRepository.getGoogleUser(code);
      } catch (e) {
        securityDefense.oauthFailure(
          ip,
          e instanceof Error ? e.message : 'oauth_token_error',
        );
        throw e;
      }
      const { email, name, id: googleProviderId } = googleUser;

      if (!googleProviderId) {
        throw new BadRequestException(
          'Google 계정에서 제공자 식별자를 받지 못했습니다.',
        );
      }

      const foundUser = await this.#authRepository.findUserByEmail(email);
      let userId: string;
      if (!foundUser) {
        const newUser = await this.#authRepository.createUser({
          email,
          nickname: name,
          password: null,
        });
        userId = newUser.id;
      } else {
        userId = foundUser.id;
      }

      await this.#authRepository.upsertGoogleSocial(userId, googleProviderId);
      const userWithSocials = await this.#authRepository.findUserById(userId);
      if (!userWithSocials) {
        throw new UnauthorizedException(ERROR_MESSAGE.USER_NOT_FOUND);
      }

      const accessToken =
        this.#tokenProvider.generateAccessToken(userWithSocials);
      const refreshToken =
        this.#tokenProvider.generateRefreshToken(userWithSocials);
      await this.#authRepository.saveRefreshToken(
        userWithSocials.id,
        refreshToken,
      );

      const { password: _pw, ...userWithoutPassword } = userWithSocials;
      securityDefense.oauthSuccess(ip, userWithSocials.id);
      return {
        user: this.#toAuthUserResponse(userWithoutPassword),
        accessToken,
        refreshToken,
      };
    }

    throw new BadRequestException(`지원하지 않는 provider입니다: ${provider}`);
  }
  async me(userId: string) {
    const user = await this.#authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGE.USER_NOT_FOUND);
    }
    const { password: _pw, ...userWithoutPassword } = user;
    return this.#toAuthUserResponse(userWithoutPassword);
  }

  // 계정 열거 방지
  async requestPasswordReset(
    { email }: { email: string },
    requestContext: { ip?: string } = {},
  ) {
    const ip = requestContext.ip ?? 'unknown';
    logSecurityEvent({
      type: 'password_reset_request',
      ip,
      emailMasked: maskEmail(
        typeof email === 'string' ? email.trim() : String(email),
      ),
    });

    const user = await this.#authRepository.findUserByEmail(email);
    const generic = {
      message: SUCCESS_MESSAGE.PASSWORD_RESET_REQUEST_ACCEPTED,
    };

    if (!user || user.password == null || user.password === '') {
      return generic;
    }

    await this.#authRepository.deletePendingPasswordResetsForUser(user.id);

    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRES_MS);

    await this.#authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const resetLink = buildPasswordResetLink(rawToken);
    await sendPasswordResetEmail({ to: user.email, resetLink });

    return generic;
  }

  async confirmPasswordReset(
    { token, password }: { token: string; password: string },
    requestContext: { ip?: string } = {},
  ) {
    const ip = requestContext.ip ?? 'unknown';
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const userId =
      await this.#authRepository.consumePasswordResetToken(tokenHash);
    if (!userId) {
      logSecurityEvent({
        type: 'password_reset_confirm_failed',
        ip,
        reason: 'invalid_or_expired_token',
      });
      throw new BadRequestException(ERROR_MESSAGE.PASSWORD_RESET_LINK_INVALID);
    }

    const hashedPassword = await this.#passwordProvider.hash(password);
    await this.#authRepository.updateUserPassword(userId, hashedPassword);
    await this.#authRepository.deleteRefreshToken(userId);
    await this.#authRepository.setUserLoginLockedUntil(userId, null);

    logSecurityEvent({
      type: 'password_reset_confirm_success',
      ip,
      userId,
    });

    return { message: SUCCESS_MESSAGE.PASSWORD_RESET_COMPLETED };
  }
}
