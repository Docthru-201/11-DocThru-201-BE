import { AuthProvider } from '#generated/prisma/enums.ts';
import { REFRESH_TOKEN_EXPIRES_DAYS } from '../common/constants/auth.js';

const googleSocialInclude = {
  socials: {
    where: { provider: AuthProvider.GOOGLE },
    select: { id: true },
  },
};

export class AuthRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findUserByEmail(email) {
    return this.#prisma.user.findUnique({
      where: { email },
      include: googleSocialInclude,
    });
  }

  findUserByNickname(nickname) {
    return this.#prisma.user.findUnique({
      where: { nickname },
    });
  }
  findUserById(id) {
    return this.#prisma.user.findUnique({
      where: { id },
      include: googleSocialInclude,
    });
  }

  createUser(data) {
    return this.#prisma.user.create({
      data,
    });
  }

  saveRefreshToken(userId, token) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS); // 7일 후 만료 예시

    return this.#prisma.refreshToken.upsert({
      where: { userId },
      update: { token, expiresAt },
      create: { userId, token, expiresAt },
    });
  }

  findRefreshToken(userId) {
    return this.#prisma.refreshToken.findUnique({
      where: { userId },
    });
  }

  deleteRefreshToken(userId) {
    return this.#prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  upsertGoogleSocial(userId, providerId) {
    return this.#prisma.socialAccount.upsert({
      where: {
        userId_provider: {
          userId,
          provider: AuthProvider.GOOGLE,
        },
      },
      update: { providerId },
      create: {
        userId,
        provider: AuthProvider.GOOGLE,
        providerId,
      },
    });
  }

  async getGoogleUser(code) {
    // 1. code로 accessToken 요청
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error('구글 토큰 발급 실패');
    }

    // 2. accessToken으로 사용자 정보 요청
    const userResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );
    if (!userResponse.ok) {
      throw new Error('구글 유저 정보 조회 실패');
    }

    const userData = await userResponse.json();

    return userData;
  }
}
