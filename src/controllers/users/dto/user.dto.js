// updateUserSchema.js
import { z } from 'zod';
import { nicknameSchema, imageUrlSchema } from '../../schemas/baseSchema.js';

// userId path param
export const userIdParamSchema = z.object({
  userId: z.string().uuid({ message: '올바른 userId 형식이 아닙니다.' }),
});

export const updateUserSchema = z
  .object({
    nickname: nicknameSchema.optional(), // baseSchema 규칙 재사용
    image: imageUrlSchema.optional(), // baseSchema 규칙 재사용
  })
  .strict();
