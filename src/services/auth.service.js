import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '#exceptions';
import { ERROR_MESSAGE } from '#constants';

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

    const existEmail = await this.#authRepository.findUserByEmail(email);
    if (existEmail) {
      throw new ConflictException(ERROR_MESSAGE.EMAIL_ALREADY_EXISTS);
    }

    const existNickname =
      await this.#authRepository.findUserByNickname(nickname);

    if (existNickname) {
      throw new ConflictException(ERROR_MESSAGE.NICKNAME_ALREADY_EXISTS);
    }

    const hashedPassword = await this.#passwordProvider.hashPassword(password);

    const user = await this.#authRepository.createUser({
      email,
      nickname,
      password: hashedPassword,
    });

    const { password: _pw, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async login(data) {
    const { email, password } = data;

    const user = await this.#authRepository.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_LOGIN);
    }

    const isMatch = await this.#passwordProvider.comparePassword(
      password,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_LOGIN);
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

    const user = { id: payload.userId };

    const newAccessToken = this.#tokenProvider.generateAccessToken(user);
    const newRefreshToken = this.#tokenProvider.generateRefreshToken(user);

    await this.#authRepository.saveRefreshToken(
      payload.userId,
      newRefreshToken,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
