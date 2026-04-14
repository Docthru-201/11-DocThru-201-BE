import type { PrismaClient } from '#generated/prisma/client.js';
import { AuthProvider } from '#generated/prisma/enums.ts';
import { REFRESH_TOKEN_EXPIRES_DAYS } from '../common/constants/auth.js';

const googleSocialInclude = {
  socials: {
    where: { provider: AuthProvider.GOOGLE },
    select: { id: true },
  },
};

export class AuthRepository {
  #prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.#prisma = prisma;
  }

  findUserByEmail(email: string) {
    return this.#prisma.user.findUnique({
      where: { email },
      include: googleSocialInclude,
    });
  }

  findUserByNickname(nickname: string) {
    return this.#prisma.user.findUnique({
      where: { nickname },
    });
  }
  findUserById(id: string) {
    return this.#prisma.user.findUnique({
      where: { id },
      include: googleSocialInclude,
    });
  }

  createUser(data: {
    email: string;
    nickname: string;
    password: string | null;
  }) {
    return this.#prisma.user.create({
      data,
    });
  }

  saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    return this.#prisma.refreshToken.upsert({
      where: { userId },
      update: { token, expiresAt },
      create: { userId, token, expiresAt },
    });
  }

  findRefreshToken(userId: string) {
    return this.#prisma.refreshToken.findUnique({
      where: { userId },
    });
  }

  deleteRefreshToken(userId: string) {
    return this.#prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  upsertGoogleSocial(userId: string, providerId: string) {
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

  async getGoogleUser(code: string) {
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

  deletePendingPasswordResetsForUser(userId: string) {
    return this.#prisma.passwordResetToken.deleteMany({
      where: { userId, usedAt: null },
    });
  }

  createPasswordResetToken({
    userId,
    tokenHash,
    expiresAt,
  }: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return this.#prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  /**
   * 토큰 1회용 소비. 성공 시 userId, 실패(만료·이미 사용·없음) 시 null
   */
  async consumePasswordResetToken(tokenHash: string) {
    return this.#prisma.$transaction(async (tx) => {
      const row = await tx.passwordResetToken.findUnique({
        where: { tokenHash },
      });
      if (!row || row.usedAt || row.expiresAt <= new Date()) {
        return null;
      }
      const upd = await tx.passwordResetToken.updateMany({
        where: {
          id: row.id,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { usedAt: new Date() },
      });
      if (upd.count !== 1) {
        return null;
      }
      return row.userId;
    });
  }

  updateUserPassword(userId: string, hashedPassword: string) {
    return this.#prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  setUserLoginLockedUntil(userId: string, loginLockedUntil: Date | null) {
    return this.#prisma.user.update({
      where: { id: userId },
      data: { loginLockedUntil },
    });
  }
}
