// updateUserSchema.js
import { z } from 'zod';
import { nicknameSchema, imageUrlSchema } from '../../schemas/baseSchema.js';

export const updateUserSchema = z
  .object({
    nickname: nicknameSchema.optional(), // baseSchema 규칙 재사용
    image: imageUrlSchema.optional(), // baseSchema 규칙 재사용
  })
  .strict();
