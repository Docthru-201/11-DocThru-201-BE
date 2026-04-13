import { config } from '#config';
import { DAY_IN_MS, MINUTE_IN_MS } from '#constants';

const isProd = () => config.NODE_ENV === 'production';

/** 프로덕션: 크로스 사이트 fetch에 쿠키를 붙이려면 none + secure */
function authCookieBaseOptions() {
  const prod = isProd();
  return {
    path: '/',
    sameSite: prod ? 'none' : 'lax',
    secure: prod,
  };
}

export class CookieProvider {
  /**
   * 인증 후 새 토큰 발급. 세션 고정 완화: 기존 access/refresh 쿠키를 먼저 제거한 뒤 새 값 설정.
   */
  setAuthCookies(res, tokens) {
    this.clearAuthCookies(res);

    const { accessToken, refreshToken } = tokens;
    const base = authCookieBaseOptions();

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      ...base,
      maxAge: 15 * MINUTE_IN_MS,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      ...base,
      maxAge: 7 * DAY_IN_MS,
    });
  }

  clearAuthCookies(res) {
    const base = authCookieBaseOptions();
    res.clearCookie('accessToken', base);
    res.clearCookie('refreshToken', base);
  }

  getRefreshToken(req) {
    return req.cookies?.refreshToken;
  }
}
