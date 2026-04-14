import type { Request, Response, NextFunction } from 'express';
import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { needsLogin, validate } from '#middlewares';
import { workIdParamSchema } from '#controllers/schemas/baseSchema.js';
import type { LikesService } from '#services';

export class LikesController extends BaseController {
  #likesService: LikesService;

  constructor({ likesService }: { likesService: LikesService }) {
    super();
    this.#likesService = likesService;
  }

  routes() {
    // 1. 좋아요 갯수 조회
    this.router.get(
      '/:workId/likes/count',
      validate('params', workIdParamSchema),
      (req, res, next) => this.getLikeCount(req, res, next),
    );

    // 2. 내 좋아요 클릭 여부
    this.router.get(
      '/:workId/likes/me',
      needsLogin,
      validate('params', workIdParamSchema),
      (req, res, next) => this.getMyLikeStatus(req, res, next),
    );

    // 3. 좋아요 추가
    this.router.post(
      '/:workId/likes',
      needsLogin,
      validate('params', workIdParamSchema),
      (req, res, next) => this.like(req, res, next),
    );

    // 4. 좋아요 취소
    this.router.delete(
      '/:workId/likes',
      needsLogin,
      validate('params', workIdParamSchema),
      (req, res, next) => this.unlike(req, res, next),
    );

    return this.router;
  }

  async getLikeCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await this.#likesService.getLikeCount(
        req.params.workId as string,
      );
      res.status(HTTP_STATUS.OK).json({ count });
    } catch (error) {
      next(error);
    }
  }

  async getMyLikeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const isLiked = await this.#likesService.getMyLikeStatus(
        req.user.id,
        req.params.workId as string,
      );
      res.status(HTTP_STATUS.OK).json({ isLiked });
    } catch (error) {
      next(error);
    }
  }

  async like(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.#likesService.like(
        req.user.id,
        req.params.workId as string,
      );
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  }

  async unlike(req: Request, res: Response, next: NextFunction) {
    try {
      await this.#likesService.unlike(req.user.id, req.params.workId as string);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}
