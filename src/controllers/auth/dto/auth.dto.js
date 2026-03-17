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
