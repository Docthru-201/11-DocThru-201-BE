import { z } from 'zod';
//⭐️수전전
// export const workIdParamSchema = z.object({
//   workId: z.string({
//     required_error: '잘못된 접근입니다. 작업물 Id 정보가 누락되었습니다.',
//   }),
// });
// export const commentIdParamSchema = z.object({
//   workId: z.string({
//     required_error: '잘못된 접근입니다. 댓글 Id 정보가 누락되었습니다.',
//   }),
// });
// export const createCommentSchema = z.object({
//   workId: z.string({
//     required_error: '잘못된 접근입니다. 작업물 Id 정보가 누락되었습니다.',
//   }),
//   content: z.string().min(1, '댓글 내용을 작성해주세요.'),
//   parentId: z.string().optional(), //대댓글을 위한 부모댓글 id
// });
// export const updateCommentSchema = z.object({
//   content: z.string().min(1, '수정할 댓글을 작성해주세요').optional(),
// });
//⭐️수정후
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

export const commentIdParamSchema = z
  .object({
    commentId: ulidSchema,
  })
  .meta({
    id: 'params.commentId',
    description: '경로 파라미터: commentId (ULID)',
  });

export const createCommentSchema = z
  .object({
    content: z.string().min(1, '댓글 내용을 작성해주세요.'),
    parentId: ulidSchema.optional().nullable(),
  })
  .meta({ id: 'CreateCommentBody', description: '댓글 생성 요청 바디' });

export const updateCommentBodySchema = z
  .object({
    content: z.string().min(1, '수정할 댓글을 작성해주세요').optional(),
  })
  .refine((obj) => Object.values(obj).some((v) => v !== undefined), {
    message: '수정할 필드가 하나 이상 필요합니다.',
  })
  .meta({ id: 'UpdateCommentBody', description: '댓글 수정 요청 바디' });
