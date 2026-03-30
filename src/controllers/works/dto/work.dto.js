import { z } from 'zod';
import { WORK_LIMITS } from '#constants';
import {
  ulidSchema,
  contentSchema,
  jsonStringSchema,
  idParamSchema,
} from '../../schemas/baseSchema.js';

const { CONTENT_MAX_LENGTH } = WORK_LIMITS;

/** GET /challenges/:challengeId/works — 쿼리 페이지네이션 */
export const workListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(5),
});

// --------------------
// Path Param (`/:id` — 작업물 ID)
// --------------------
export const workIdParamSchema = idParamSchema;

// --------------------
// Body
// --------------------

// Work 생성 /works (POST)
export const createWorkSchema = z
  .object({
    challengeId: ulidSchema,
    // contentSchema와 jsonStringSchema를 결합하여 중복 로직 제거
    content: jsonStringSchema.and(
      contentSchema(CONTENT_MAX_LENGTH, '작업물 내용을 입력해주세요.'),
    ),
  })
  .strict()
  .meta({ description: '작업물 생성 DTO' });

// Work 수정 /works/:id (PATCH)
// action: 'SUBMIT' → 제출하기 / 없음 → 임시저장
export const updateWorkSchema = z
  .object({
    content: jsonStringSchema
      .and(contentSchema(CONTENT_MAX_LENGTH, '작업물 내용을 입력해주세요.'))
      .optional(),
    action: z.enum(['SUBMIT']).optional(),
  })
  .strict()
  .refine((obj) => obj.content !== undefined || obj.action !== undefined, {
    message: '수정할 필드가 하나 이상 필요합니다.',
  })
  .meta({ description: '작업물 수정 DTO (임시저장 / 제출하기 / 수정하기)' });
