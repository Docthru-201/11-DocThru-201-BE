import { z } from 'zod';

export const ulidSchema = z
  .string()
  .regex(/^[0-9A-HJKMNP-TV-Z]{26}$/, {
    message: '유효한 id 형식(ULID)이 아닙니다.',
  })
  .meta({
    id: 'ulid',
    title: 'ULID',
    description: 'Prisma ULID (26 chars base32)',
  });
export const workIdParamSchema = z
  .object({
    workId: ulidSchema,
  })
  .meta({
    id: 'params.workId',
    description: '경로 파라미터: 좋아요를 누를 대상 게시물의 workId (ULID)',
  });

export const likeCountResponseSchema = z
  .object({
    workId: ulidSchema,
    count: z.number().int().min(0).describe('게시물의 총 좋아요 개수'),
  })
  .meta({ id: 'LikeCountResponse', description: '좋아요 개수 조회 응답 바디' });

// [GET] /works/:workId/likes/me (좋아요 클릭 여부)
export const likeStatusResponseSchema = z
  .object({
    isLiked: z.boolean().describe('현재 로그인한 유저의 좋아요 클릭 여부'),
  })
  .meta({
    id: 'LikeStatusResponse',
    description: '내 좋아요 상태 조회 응답 바디',
  });

// [POST] & [DELETE] (좋아요 추가/취소 성공 응답)
export const likeActionResponseSchema = z
  .object({
    success: z.boolean(),
    message: z.string().optional(),
  })
  .meta({
    id: 'LikeActionResponse',
    description: '좋아요 추가 및 취소 결과 응답 바디',
  });
