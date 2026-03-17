import { z } from 'zod';
import {
  emailSchema,
  nicknameSchema,
  passwordSchema,
} from '../../schemas/baseSchema.js';

export const signupSchema = z
  .object({
    email: emailSchema,

    nickname: nicknameSchema,

    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, { message: '비밀번호 확인을 입력해주세요.' }),
  })
  .strict()

  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

export const loginSchema = z
  .object({
    email: emailSchema,

    password: z.string().min(1, { message: '비밀번호를 입력해주세요.' }),
  })
  .strict();

// OAuth callback query param
export const oauthCallbackQuerySchema = z.object({
  code: z.string().nonempty({ message: 'code가 필요합니다.' }),
  state: z.string().nonempty({ message: 'state가 필요합니다.' }),
});

// OAuth provider param
export const oauthProviderParamSchema = z.object({
  provider: z.enum(['google', 'kakao', 'naver'], {
    message: '지원하지 않는 OAuth Provider입니다.',
  }),
});
