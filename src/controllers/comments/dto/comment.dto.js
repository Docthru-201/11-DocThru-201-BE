import { z } from 'zod';
import { ulidSchema, contentSchema } from '../../schemas/baseSchema.js';

// --------------------
// Path Param
// --------------------

// 게시물 workId 검증
export const workIdParamSchema = z
  .object({
    workId: ulidSchema,
  })
  .meta({
    id: 'params.workId',
    description: '경로 파라미터: 게시물 workId (ULID)',
  });

// 댓글 commentId 검증
export const commentIdParamSchema = z
  .object({
    commentId: ulidSchema,
  })
  .meta({
    id: 'params.commentId',
    description: '경로 파라미터: 댓글 commentId (ULID)',
  });

// --------------------
// Body
// --------------------

// 댓글/대댓글 작성 /works/:workId/comments (POST)
export const createCommentSchema = z
  .object({
    content: contentSchema(1000, '댓글 내용을 작성해주세요.'),
    parentId: ulidSchema.optional().nullable(), // 대댓글용 부모 댓글 ID
  })
  .strict()
  .meta({ description: '댓글 작성 DTO' });

// 댓글 수정 /comments/:commentId (PATCH)
export const updateCommentSchema = z
  .object({
    content: contentSchema(1000, '댓글 내용을 작성해주세요.'),
  })
  .strict()
  .meta({ description: '댓글 수정 DTO' });
