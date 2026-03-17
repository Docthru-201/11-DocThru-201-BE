import { z } from 'zod';

// --------------------
// Path Param
// --------------------
export const workIdParamSchema = z.object({
  workId: z.string().uuid({ message: '올바른 workId 형식이 아닙니다.' }),
});

// 좋아요 POST/DELETE에는 body 필요 없음 (로그인한 유저 기준)
