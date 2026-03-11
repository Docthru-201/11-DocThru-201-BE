import { z } from 'zod';

// ID 파라미터 검증 스키마
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive({
    message: 'ID는 양수여야 합니다.',
  }),
});

// 사용자 생성 스키마
export const createUserSchema = z.object({
  email: z.email('유효한 이메일 형식이 아닙니다.'),
  password: z
    .string({ error: '비밀번호는 필수입니다.' })
    .min(6, '비밀번호는 6자 이상이어야 합니다.'),
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.').optional(),
});

// 사용자 수정 스키마
export const updateUserSchema = z
  .object({
    email: z.email('유효한 이메일 형식이 아닙니다.').optional(),
    name: z.string().min(2, '이름은 2자 이상이어야 합니다.').optional(),
  })
  .refine((data) => data.email !== undefined || data.name !== undefined, {
    message: '수정할 필드가 하나 이상 필요합니다.',
  });
