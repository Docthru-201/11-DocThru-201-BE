import { z } from 'zod';

export const workIdParamSchema = z.object({
  workId: z.string({
    required_error: '잘못된 접근입니다. workID 정보가 누락되었습니다.',
  }),
});
export const commentIdParamSchema = z.object({
  workId: z.string({
    required_error: '잘못된 접근입니다. 댓글ID 정보가 필요합니다.',
  }),
});
export const createCommentSchema = z.object({
  workId: z.string({
    required_error: '잘못된 접근입니다. workID 정보가 누락되었습니다.',
  }),
  content: z.string().min(1, '댓글 내용을 작성해주세요.'),
  parentId: z.string().optional(), //대댓글을 위한 부모댓글 id
});
export const updateCommentSchema = z.object({
  content: z.string().min(1, '수정할 댓글을 작성해주세요').optional(),
});
