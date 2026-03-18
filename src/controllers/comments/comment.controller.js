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

export class CommentsController extends BaseController {
  #commentsService; // 클래스 private 필드

  constructor({ commentsService }) {
    super();
    this.#commentsService = commentsService; // 정확히 일치
  }

  routes() {
    // 1️⃣ 댓글/대댓글 작성
    this.router.post(
      '/works/:workId/comments',
      needsLogin,
      validate('params', workIdParamSchema),
      validate('body', createCommentSchema),
      (req, res) => this.createComment(req, res),
    );

    // 2️⃣ 특정 작업물 댓글 목록 조회
    this.router.get(
      '/works/:workId/comments',
      validate('params', workIdParamSchema),
      (req, res) => this.getCommentsByWork(req, res),
    );

    // 3️⃣ 댓글/대댓글 수정
    this.router.patch(
      '/comments/:commentId',
      needsLogin,
      validate('params', commentIdParamSchema),
      validate('body', updateCommentSchema),
      (req, res) => this.updateComment(req, res),
    );

    // 4️⃣ 댓글/대댓글 삭제
    this.router.delete(
      '/comments/:commentId',
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
    const { commentId } = req.params;
    const commentData = req.body;

    const updatedComment = await this.#commentsService.updateComment(
      commentId,
      userId,
      commentData,
    );

    res.status(HTTP_STATUS.OK).json(updatedComment);
  }

  async deleteComment(req, res) {
    const userId = req.user.id;
    const { commentId } = req.params;

    await this.#commentsService.deleteComment(commentId, userId);

    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }
}
