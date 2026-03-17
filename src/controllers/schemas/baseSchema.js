import { z } from 'zod';
import { AUTH_LIMITS, REGEX } from '../../common/constants/auth.js';

// 이메일
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { message: '이메일을 입력해주세요.' })
  .email({ message: '올바른 이메일 형식이 아닙니다.' });

// 닉네임
export const nicknameSchema = z
  .string()
  .trim()
  .min(AUTH_LIMITS.NICKNAME.MIN_LENGTH, {
    message: `닉네임은 최소 ${AUTH_LIMITS.NICKNAME.MIN_LENGTH}자 이상입니다.`,
  })
  .max(AUTH_LIMITS.NICKNAME.MAX_LENGTH, {
    message: `닉네임은 ${AUTH_LIMITS.NICKNAME.MAX_LENGTH}자 이하입니다.`,
  })
  .regex(REGEX.NICKNAME, {
    message: '닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.',
  });

// 비밀번호
export const passwordSchema = z
  .string()
  .nonempty({ message: '비밀번호를 입력해주세요.' })
  .min(AUTH_LIMITS.PASSWORD.MIN_LENGTH, {
    message: `비밀번호는 최소 ${AUTH_LIMITS.PASSWORD.MIN_LENGTH}자 이상이어야 합니다.`,
  })
  .max(AUTH_LIMITS.PASSWORD.MAX_LENGTH, {
    message: `비밀번호는 ${AUTH_LIMITS.PASSWORD.MAX_LENGTH}자 이하로 입력해주세요.`,
  })
  .regex(REGEX.PASSWORD_LETTER, {
    message: '비밀번호에 영문자를 포함해주세요.',
  })
  .regex(REGEX.PASSWORD_NUMBER, { message: '비밀번호에 숫자를 포함해주세요.' })
  .regex(REGEX.PASSWORD_SPECIAL, {
    message: '비밀번호에 특수문자를 포함해주세요.',
  });

// 자기소개
export const introductionSchema = z
  .string()
  .trim()
  .max(AUTH_LIMITS.INTRODUCTION.MAX_LENGTH, {
    message: `자기소개는 ${AUTH_LIMITS.INTRODUCTION.MAX_LENGTH}자 이하로 입력해주세요.`,
  })
  .optional();

// 이미지 URL
export const imageUrlSchema = z
  .string()
  .trim()
  .url({ message: '올바른 이미지 URL 형식이 아닙니다.' })
  .optional();
