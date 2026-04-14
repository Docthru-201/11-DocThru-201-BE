import jwt from 'jsonwebtoken';
import { config } from '#config';

interface TokenUser {
  id: string;
  nickname: string;
  role: string;
}

export class TokenProvider {
  #accessSecret: string;
  #refreshSecret: string;

  constructor() {
    this.#accessSecret = config.JWT_ACCESS_SECRET;
    this.#refreshSecret = config.JWT_REFRESH_SECRET;
  }

  generateAccessToken(user: TokenUser): string {
    return jwt.sign(
      {
        userId: user.id,
        nickname: user.nickname,
        role: user.role,
      },
      this.#accessSecret,
      { expiresIn: '15m' },
    );
  }

  generateRefreshToken(user: TokenUser): string {
    return jwt.sign({ userId: user.id }, this.#refreshSecret, {
      expiresIn: '7d',
    });
  }

  generateTokens(user: TokenUser): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): jwt.JwtPayload | null {
    return this.#verifyToken(token, this.#accessSecret);
  }

  verifyRefreshToken(token: string): jwt.JwtPayload | null {
    return this.#verifyToken(token, this.#refreshSecret);
  }

  #verifyToken(token: string, secret: string): jwt.JwtPayload | null {
    try {
      return jwt.verify(token, secret) as jwt.JwtPayload;
    } catch {
      return null;
    }
  }
}
