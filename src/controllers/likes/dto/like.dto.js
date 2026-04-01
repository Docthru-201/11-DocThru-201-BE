import { z } from 'zod';
import { ulidSchema, workIdParamSchema } from '../../schemas/baseSchema.js';

export { workIdParamSchema };

// --------------------
// Response Schemas
// --------------------

// 좋아요 개수 조회
export const likeCountResponseSchema = z
  .object({
    workId: ulidSchema, // baseSchema 적용
  })
  .meta({ id: 'LikeCountResponse', description: '좋아요 개수 조회 응답 바디' });

// 내 좋아요 상태 조회
export const likeStatusResponseSchema = z
  .object({
    isLiked: z.boolean().describe('현재 로그인한 유저의 좋아요 클릭 여부'),
  })
  .meta({
    id: 'LikeStatusResponse',
    description: '내 좋아요 상태 조회 응답 바디',
  });

// 좋아요 추가/취소 성공 응답
export const likeActionResponseSchema = z
  .object({
    success: z.boolean(),
    message: z.string().optional(),
  })
  .meta({
    id: 'LikeActionResponse',
    description: '좋아요 추가 및 취소 결과 응답 바디',
  });
