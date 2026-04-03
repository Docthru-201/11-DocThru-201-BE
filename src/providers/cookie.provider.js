import { config } from '#config';
import { DAY_IN_MS, MINUTE_IN_MS } from '#constants';

const isProd = () => config.NODE_ENV === 'production';

/** clearCookie 시에도 set과 동일 옵션을 써야 브라우저에서 실제로 제거됨 */
const authCookieClearOptions = () => ({
  path: '/',
  sameSite: 'lax',
  secure: isProd(),
});

export class CookieProvider {
  /**
   * 인증 후 새 토큰 발급. 세션 고정 완화: 기존 access/refresh 쿠키를 먼저 제거한 뒤 새 값 설정.
   */
  setAuthCookies(res, tokens) {
    this.clearAuthCookies(res);

    const { accessToken, refreshToken } = tokens;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd(),
      sameSite: 'lax',
      maxAge: 15 * MINUTE_IN_MS,
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd(),
      sameSite: 'lax',
      maxAge: 7 * DAY_IN_MS,
      path: '/',
    });
  }

  clearAuthCookies(res) {
    const opts = authCookieClearOptions();
    res.clearCookie('accessToken', opts);
    res.clearCookie('refreshToken', opts);
  }

  // 🔹 새로 추가: 요청(req)에서 refreshToken 읽기
  getRefreshToken(req) {
    return req.cookies?.refreshToken;
  }
}
