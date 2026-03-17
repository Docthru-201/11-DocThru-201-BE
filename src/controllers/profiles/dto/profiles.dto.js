// updateProfileSchema.js
import { z } from 'zod';
import { introductionSchema } from '../../schemas/baseSchema.js';

export const updateProfileSchema = z
  .object({
    introduction: introductionSchema.optional(), // baseSchema의 규칙 재활용
  })
  .strict();
