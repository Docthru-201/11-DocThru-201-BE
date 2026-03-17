import { z } from 'zod';

export const updateUserSchema = z
  .object({
    nickname: z
      .string()
      .trim()
      .min(2, { message: '닉네임은 최소 2자 이상입니다.' })
      .max(8, { message: '닉네임은 8자 이하입니다.' })
      .regex(/^[가-힣a-zA-Z0-9]+$/, {
        message: '닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.',
      })
      .optional(),

    image: z
      .string()
      .trim()
      .url({ message: '올바른 이미지 URL 형식이 아닙니다.' }) // 이미지업로드 방식이 url일때를 가정
      .optional(),
  })
  .strict();
