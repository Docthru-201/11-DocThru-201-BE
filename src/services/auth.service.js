import { createHash, randomBytes } from 'node:crypto';
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '#constants';
import { PASSWORD_RESET_TOKEN_EXPIRES_MS } from '../common/constants/auth.js';
import { sendPasswordResetEmail } from '#providers';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '#exceptions';

function buildPasswordResetLink(rawToken) {
  const base =
    process.env.CLIENT_BASE_URL?.trim()?.replace(/\/$/, '') ||
    'http://localhost:3000';
  const pathSeg =
    process.env.PASSWORD_RESET_CLIENT_PATH?.trim() || '/reset-password';
  const path = pathSeg.startsWith('/') ? pathSeg : `/${pathSeg}`;
  return `${base}${path}?token=${encodeURIComponent(rawToken)}`;
}

export class AuthService {
  #authRepository;
  #passwordProvider;
  #tokenProvider;

  constructor({ authRepository, passwordProvider, tokenProvider }) {
    this.#authRepository = authRepository;
    this.#passwordProvider = passwordProvider;
    this.#tokenProvider = tokenProvider;
  }

  #toAuthUserResponse(user) {
    if (!user) return user;
    const { password: _pw, socials, ...rest } = user;
    return {
      ...rest,
      hasGoogleAccount: Array.isArray(socials) && socials.length > 0,
    };
  }

  async signup(data) {
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

  async login(data) {
    const { email, password } = data;

    // 1. 유저 존재 확인
    const user = await this.#authRepository.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_LOGIN);
    }

    if (user.password == null || user.password === '') {
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_LOGIN);
    }

    // 2. 비밀번호 검증 (PasswordProvider의 compare 사용)
    const isMatch = await this.#passwordProvider.compare(
      password,
      user.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_LOGIN);
    }

    // 3. 토큰 발급
    const accessToken = this.#tokenProvider.generateAccessToken(user);
    const refreshToken = this.#tokenProvider.generateRefreshToken(user);

    await this.#authRepository.saveRefreshToken(user.id, refreshToken);

    const { password: _pw, ...userWithoutPassword } = user;
    return {
      user: this.#toAuthUserResponse(userWithoutPassword),
      accessToken,
      refreshToken,
    };
  }

  async logout(userId) {
    await this.#authRepository.deleteRefreshToken(userId);
  }

  async logoutAll(userId) {
    await this.#authRepository.deleteRefreshToken(userId);
  }

  async refresh(refreshToken) {
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
  getOAuthLoginUrl(provider) {
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
      const state = crypto.randomUUID();

      return {
        url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent('email profile')}&state=${state}`,
        state,
      };
    }
    throw new BadRequestException(`지원하지 않는 provider입니다: ${provider}`);
  }
  async oauthLogin(provider, code) {
    if (provider === 'google') {
      const googleUser = await this.#authRepository.getGoogleUser(code);
      const { email, name, id: googleProviderId } = googleUser;

      if (!googleProviderId) {
        throw new BadRequestException(
          'Google 계정에서 제공자 식별자를 받지 못했습니다.',
        );
      }

      let user = await this.#authRepository.findUserByEmail(email);
      if (!user) {
        user = await this.#authRepository.createUser({
          email,
          nickname: name,
          password: null,
        });
      }

      await this.#authRepository.upsertGoogleSocial(user.id, googleProviderId);
      const userWithSocials = await this.#authRepository.findUserById(user.id);

      const accessToken =
        this.#tokenProvider.generateAccessToken(userWithSocials);
      const refreshToken =
        this.#tokenProvider.generateRefreshToken(userWithSocials);
      await this.#authRepository.saveRefreshToken(
        userWithSocials.id,
        refreshToken,
      );

      const { password: _pw, ...userWithoutPassword } = userWithSocials;
      return {
        user: this.#toAuthUserResponse(userWithoutPassword),
        accessToken,
        refreshToken,
      };
    }

    throw new BadRequestException(`지원하지 않는 provider입니다: ${provider}`);
  }
  async me(userId) {
    const user = await this.#authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGE.USER_NOT_FOUND);
    }
    const { password: _pw, ...userWithoutPassword } = user;
    return this.#toAuthUserResponse(userWithoutPassword);
  }

  // 계정 열거 방지
  async requestPasswordReset({ email }) {
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

  async confirmPasswordReset({ token, password }) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const userId =
      await this.#authRepository.consumePasswordResetToken(tokenHash);
    if (!userId) {
      throw new BadRequestException(ERROR_MESSAGE.PASSWORD_RESET_LINK_INVALID);
    }

    const hashedPassword = await this.#passwordProvider.hash(password);
    await this.#authRepository.updateUserPassword(userId, hashedPassword);
    await this.#authRepository.deleteRefreshToken(userId);

    return { message: SUCCESS_MESSAGE.PASSWORD_RESET_COMPLETED };
  }
}
