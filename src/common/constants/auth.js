export const AUTH_LIMITS = {
  NICKNAME: { MIN_LENGTH: 2, MAX_LENGTH: 8 },
  PASSWORD: { MIN_LENGTH: 8, MAX_LENGTH: 15 },
  INTRODUCTION: { MAX_LENGTH: 500 },
};

export const REGEX = {
  NICKNAME: /^[가-힣a-zA-Z0-9]+$/,
  PASSWORD_LETTER: /[A-Za-z]/,
  PASSWORD_NUMBER: /[0-9]/,
  PASSWORD_SPECIAL: /[!@#$%^&*(),.?":{}|<>]/,
};
export const REFRESH_TOKEN_EXPIRES_DAYS = 7;
export const OAUTH_STATE_EXPIRES_MS = 1000 * 60 * 5; // 5분
