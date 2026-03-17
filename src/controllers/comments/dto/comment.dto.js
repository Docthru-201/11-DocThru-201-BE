import { z } from 'zod';

// --------------------
// Path Param
// --------------------
export const workIdParamSchema = z.object({
  workId: z.string().uuid({ message: '올바른 workId 형식이 아닙니다.' }),
});

export const commentIdParamSchema = z.object({
  id: z.string().uuid({ message: '올바른 commentId 형식이 아닙니다.' }),
});

// --------------------
// Body
// --------------------

// 댓글/대댓글 작성 /works/:workId/comments (POST)
export const createCommentSchema = z
  .object({
    content: z.string().min(1, { message: '댓글 내용을 입력해주세요.' }),
    parentId: z.string().uuid().optional(), // 대댓글이면 parentId 포함
  })
  .strict();

// 댓글 수정 /comments/:id (PATCH)
export const updateCommentSchema = z
  .object({
    content: z.string().min(1, { message: '댓글 내용을 입력해주세요.' }),
  })
  .strict();
