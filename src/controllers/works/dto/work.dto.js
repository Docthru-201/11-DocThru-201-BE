//⭐️수정전
//import { z } from 'zod';
// export const workIdParamSchema = z.object({
//   id: z.string().min(1, '잘못된 접근입니다. 유효한 작업물 Id가 필요합니다.'), // ULID는 문자열
// });
// export const createWorkSchema = z.object({
//   challengeId: z.string({
//     required_error: '잘못된 접근입니다. 챌린지 정보가 누락되었습니다.',
//   }),
//   content: z.string().min(1, '작업물의 내용을 작성해주세요.'),
// });
// export const updateWorkSchema = z.object({
//   content: z.string().min(1, '수정할 본문 내용을 입력해주세요.').optional(),
// });
//⭐️수정후
import { z } from 'zod';

/** ULID(Prisma id) 간단 패턴 — 필요하면 완화 가능 */
export const ulidSchema = z
  .string()
  .regex(/^[0-9A-HJKMNP-TV-Z]{26}$/, {
    message: '유효한 id 형식(ULID)이 아닙니다.',
  })
  .meta({ id: 'ulid', title: 'ULID' });

/** 경로 파라미터 (router.get('/works/:workId/...')) */
export const workIdParamSchema = z
  .object({
    id: ulidSchema,
  })
  .meta({ description: '경로 파라미터: workId (ULID)' });

/** 생성 요청: POST /works */
export const createWorkSchema = z
  .object({
    challengeId: ulidSchema,
    title: z.string().min(1, '제목을 입력해주세요.'),
    // Tiptap JSON 문자열인 경우를 대비해 JSON 파싱 가능성 검사 추가
    content: z
      .string()
      .min(1, '작업물의 내용을 작성해주세요.')
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
  .meta({ description: '작업물 생성 DTO' });

export const updateWorkSchema = createWorkSchema
  .partial()
  .refine((obj) => Object.values(obj).some((v) => v !== undefined), {
    message: '수정할 필드가 하나 이상 필요합니다.',
  })
  .meta({ description: '작업물 수정 DTO (최소 하나의 필드 필요)' });
