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
export const updateWorkSchema = createWorkSchema
  .partial() // 모든 필드를 optional로 변환
  .refine((obj) => Object.values(obj).some((v) => v !== undefined), {
    message: '수정할 필드가 하나 이상 필요합니다.',
  })
  .meta({ description: '작업물 수정 DTO (최소 하나의 필드 필요)' });
