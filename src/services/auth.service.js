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
