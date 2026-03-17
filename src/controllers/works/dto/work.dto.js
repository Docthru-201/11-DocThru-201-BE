import { z } from 'zod';

// --------------------
// ULID Schema (Prisma ID 기준)
// --------------------
export const ulidSchema = z
  .string()
  .regex(/^[0-9A-HJKMNP-TV-Z]{26}$/, {
    message: '유효한 ID 형식(ULID)이 아닙니다.',
  })
  .meta({ id: 'ulid', title: 'ULID' });

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
    content: z
      .string()
      .nonempty({ message: '작업물 내용을 입력해주세요.' })
      .max(5000, { message: '작업물 내용은 5000자 이하로 입력해주세요.' })
      // Tiptap JSON 문자열 검증
      .refine(
        (v) => {
          try {
            JSON.parse(v);
            return true;
          } catch {
            return false;
          }
        },
        { message: 'content는 유효한 JSON 문자열이어야 합니다.' },
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
