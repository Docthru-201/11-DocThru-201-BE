import { z } from 'zod';

export const workIdParamSchema = z.object({
  id: z.string().min(1, '유효한 작업물 ID가 필요합니다.'), // ULID는 문자열
});
export const createWorkSchema = z.object({
  challengId: z.string({
    required_error: '잘못된 접근입니다. 챌린지 정보가 누락되었습니다.',
  }),
  content: z.string().min(1, '작업물의 내용을 작성해주세요.'),
});
export const updateWorkSchema = z.object({
  content: z.string().min(1, '수정할 본문 내용을 입력해주세요.').optional(),
});
