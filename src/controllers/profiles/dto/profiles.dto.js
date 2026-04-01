import { z } from 'zod';
import { introductionSchema } from '../../schemas/baseSchema.js';

export const updateProfileSchema = z
  .object({
    introduction: introductionSchema.optional(),
  })
  .strict();
