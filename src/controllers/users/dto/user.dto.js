// updateUserSchema.js
import { z } from 'zod';
import {
  nicknameSchema,
  imageUrlSchema,
  ulidSchema,
} from '../../schemas/baseSchema.js';

// userId path param
export const userIdParamSchema = z.object({
  userId: ulidSchema,
});

export const updateUserSchema = z
  .object({
    nickname: nicknameSchema.optional(), // baseSchema 규칙 재사용
    image: imageUrlSchema.optional(), // baseSchema 규칙 재사용
  })
  .strict();
