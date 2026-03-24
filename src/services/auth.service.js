import { ERROR_MESSAGE } from '#constants';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '#exceptions';

export class AuthService {
  #authRepository;
  #passwordProvider;
  #tokenProvider;

  constructor({ authRepository, passwordProvider, tokenProvider }) {
    this.#authRepository = authRepository;
    this.#passwordProvider = passwordProvider;
    this.#tokenProvider = tokenProvider;
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
    return userWithoutPassword;
  }

  async login(data) {
    const { email, password } = data;

    // 1. 유저 존재 확인
    const user = await this.#authRepository.findUserByEmail(email);
    if (!user) {
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
      user: userWithoutPassword,
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
      const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
      const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
      const state = crypto.randomUUID();

      return {
        url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email profile&state=${state}`,
        state,
      };
    }
    throw new BadRequestException(`지원하지 않는 provider입니다: ${provider}`);
  }
  async oauthLogin(provider, code) {
    if (provider === 'google') {
      const googleUser = await this.#authRepository.getGoogleUser(code);
      const { email, name } = googleUser;

      let user = await this.#authRepository.findUserByEmail(email);
      if (!user) {
        user = await this.#authRepository.createUser({
          email,
          nickname: name,
          password: null,
        });
      }

      const accessToken = this.#tokenProvider.generateAccessToken(user);
      const refreshToken = this.#tokenProvider.generateRefreshToken(user);
      await this.#authRepository.saveRefreshToken(user.id, refreshToken);

      const { password: _pw, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
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
    return userWithoutPassword;
  }
}
