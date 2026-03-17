import { z } from 'zod';

// --------------------
// Path Param
// --------------------
export const workIdParamSchema = z.object({
  id: z.string().uuid({ message: '올바른 workId 형식이 아닙니다.' }),
});

// --------------------
// Body
// --------------------

// Work 생성 /works (POST)
export const createWorkSchema = z
  .object({
    challengeId: z.string().uuid({ message: 'challengeId가 필요합니다.' }),
    content: z
      .string()
      .nonempty({ message: '작업물 내용을 입력해주세요.' })
      .max(5000, { message: '작업물 내용은 5000자 이하로 입력해주세요.' }),
  })
  .strict();

// Work 수정 /works/:id (PATCH)
export const updateWorkSchema = z
  .object({
    content: z
      .string()
      .nonempty({ message: '작업물 내용을 입력해주세요.' })
      .max(5000, { message: '작업물 내용은 5000자 이하로 입력해주세요.' })
      .optional(),
  })
  .strict();
