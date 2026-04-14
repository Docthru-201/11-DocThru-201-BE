import { z } from 'zod';
import { AUTH_LIMITS, REGEX } from '../../common/constants/auth.js';

export const ulidSchema = z.ulid({
  message: '유효한 ID 형식(ULID)이 아닙니다.',
});

export const idParamSchema = z
  .object({
    id: ulidSchema,
  })
  .meta({ description: '경로 파라미터: 리소스 ID (ULID)' });

export const workIdParamSchema = z
  .object({
    workId: ulidSchema,
  })
  .meta({
    id: 'params.workId',
    description: '경로 파라미터: 게시물 workId (ULID)',
  });

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { message: '이메일을 입력해주세요.' })
  .email({ message: '올바른 이메일 형식이 아닙니다.' });

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

export const introductionSchema = z
  .string()
  .trim()
  .max(AUTH_LIMITS.INTRODUCTION.MAX_LENGTH, {
    message: `자기소개는 ${AUTH_LIMITS.INTRODUCTION.MAX_LENGTH}자 이하로 입력해주세요.`,
  })
  .optional();

export const imageUrlSchema = z
  .string()
  .trim()
  .url({ message: '올바른 이미지 URL 형식이 아닙니다.' })
  .optional();

export const contentSchema = (maxLen: number, message?: string) =>
  z
    .string()
    .trim()
    .min(1, { message: message || '내용을 입력해주세요.' }) // nonempty와 동일 기능
    .max(maxLen, { message: `${maxLen}자 이하로 작성해주세요.` })
    .meta({
      constraints: { min: 1, max: maxLen },
      description: message,
    });

export const jsonStringSchema = z
  .string()
  .refine(
    (v) => {
      try {
        JSON.parse(v);
        return true;
      } catch {
        return false;
      }
    },
    { message: '유효한 JSON 형식이 아닙니다.' },
  )
  .meta({ format: 'json' });
