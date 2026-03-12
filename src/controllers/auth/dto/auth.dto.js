import { z } from 'zod';

export const signupSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, { message: '이메일을 입력해주세요.' })
      .email({ message: '올바른 이메일 형식이 아닙니다.' }),

    nickname: z
      .string()
      .trim()
      .min(2, { message: '닉네임은 최소 2자 이상입니다.' })
      .max(8, { message: '닉네임은 8자 이하입니다.' })
      .regex(/^[가-힣a-zA-Z0-9]+$/, {
        message: '닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.',
      }),

    password: z
      .string()
      .min(1, { message: '비밀번호를 입력해주세요.' })
      .min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
      .max(15, { message: '비밀번호는 15자 이하로 입력해주세요.' })
      .regex(/[A-Za-z]/, {
        message: '비밀번호에 영문자를 포함해주세요.',
      })
      .regex(/[0-9]/, {
        message: '비밀번호에 숫자를 포함해주세요.',
      })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: '비밀번호에 특수문자를 포함해주세요.',
      }),
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
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, { message: '이메일을 입력해주세요.' })
      .email({ message: '올바른 이메일 형식이 아닙니다.' }),

    password: z.string().min(1, { message: '비밀번호를 입력해주세요.' }),
  })
  .strict();
