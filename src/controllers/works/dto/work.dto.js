import { z } from 'zod';
import {
  ulidSchema,
  contentSchema,
  jsonStringSchema,
} from '../schemas/baseSchema.js';

// --------------------
// Path Param
// --------------------
export const workIdParamSchema = z
  .object({
    id: ulidSchema,
  })
  .meta({ description: '경로 파라미터: workId (ULID)' });

// --------------------
// Body
// --------------------

// Work 생성 /works (POST)
export const createWorkSchema = z
  .object({
    challengeId: ulidSchema,
    // contentSchema와 jsonStringSchema를 결합하여 중복 로직 제거
    content: jsonStringSchema.and(
      contentSchema(5000, '작업물 내용을 입력해주세요.'),
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
