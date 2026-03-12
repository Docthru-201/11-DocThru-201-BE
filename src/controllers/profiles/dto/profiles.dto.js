import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    introduction: z
      .string()
      .trim()
      .max(500, { message: '자기소개는 500자 이하로 입력해주세요.' })
      .optional(),
  })
  .strict();
