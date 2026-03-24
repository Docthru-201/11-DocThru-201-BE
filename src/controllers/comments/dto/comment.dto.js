import { z } from 'zod';
import { COMMENT_LIMITS } from '#constants';
import {
  ulidSchema,
  contentSchema,
  workIdParamSchema,
  idParamSchema,
} from '../../schemas/baseSchema.js';

const { CONTENT_MAX_LENGTH } = COMMENT_LIMITS;

// --------------------
// Path Param
// --------------------
export { workIdParamSchema };

// 댓글 commentId 검증 (동일 스키마, 메타만 구분)
export const commentIdParamSchema = idParamSchema.meta({
  id: 'params.commentId',
  description: '경로 파라미터: 댓글 commentId (ULID)',
});

// --------------------
// Body
// --------------------

// 댓글/대댓글 작성 /works/:workId/comments (POST)
export const createCommentSchema = z
  .object({
    content: contentSchema(CONTENT_MAX_LENGTH, '댓글 내용을 작성해주세요.'),
    parentId: ulidSchema.optional().nullable(), // 대댓글용 부모 댓글 ID
  })
  .strict()
  .meta({ description: '댓글 작성 DTO' });

// 댓글 수정 /comments/:commentId (PATCH)
export const updateCommentSchema = z
  .object({
    content: contentSchema(CONTENT_MAX_LENGTH, '댓글 내용을 작성해주세요.'),
  })
  .strict()
  .meta({ description: '댓글 수정 DTO' });
