// --------------------
// comment.controller.js
// --------------------
import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin } from '#middlewares';
import {
  workIdParamSchema,
  commentIdParamSchema,
  createCommentSchema,
  updateCommentSchema,
} from './dto/comment.dto.js';
import express from 'express';

export class CommentsController extends BaseController {
  #commentsService; // 클래스 private 필드

  constructor({ commentsService }) {
    super();
    this.#commentsService = commentsService; // 정확히 일치
    this.router = express.Router({ mergeParams: true });
  }

  routes() {
    // 1️⃣ 댓글/대댓글 작성
    this.router.post(
      '/:workId/comments',
      needsLogin,
      validate('params', workIdParamSchema),
      validate('body', createCommentSchema),
      (req, res) => this.createComment(req, res),
    );

    // 2️⃣ 특정 작업물 댓글 목록 조회
    this.router.get(
      '/:workId/comments',
      validate('params', workIdParamSchema),
      (req, res) => this.getCommentsByWork(req, res),
    );

    // 3️⃣ 댓글/대댓글 수정
    this.router.patch(
      '/:id',
      needsLogin,
      validate('params', commentIdParamSchema),
      validate('body', updateCommentSchema),
      (req, res) => this.updateComment(req, res),
    );

    // 4️⃣ 댓글/대댓글 삭제
    this.router.delete(
      '/:id',
      needsLogin,
      validate('params', commentIdParamSchema),
      (req, res) => this.deleteComment(req, res),
    );

    return this.router;
  }

  // --------------------
  // Handler Methods
  // --------------------

  async createComment(req, res) {
    const userId = req.user.id;
    const { workId } = req.params;
    const commentData = req.body;

    const newComment = await this.#commentsService.createComment(
      userId,
      workId,
      commentData,
    );

    res.status(HTTP_STATUS.CREATED).json(newComment);
  }

  async getCommentsByWork(req, res) {
    const { workId } = req.params;
    const comments = await this.#commentsService.listCommentsByWorkId(workId);
    res.status(HTTP_STATUS.OK).json(comments);
  }

  async updateComment(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const commentData = req.body;

    const updatedComment = await this.#commentsService.updateComment(
      id,
      userId,
      commentData,
    );

    res.status(HTTP_STATUS.OK).json(updatedComment);
  }

  async deleteComment(req, res) {
    const userId = req.user.id;
    const { id } = req.params;

    await this.#commentsService.deleteComment(id, userId);

    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }
}
