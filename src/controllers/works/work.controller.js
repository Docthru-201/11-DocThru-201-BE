import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin } from '#middlewares';
import {
  createWorkSchema,
  updateWorkSchema,
  workIdParamSchema,
} from './dto/works.dto.js'; // 경로에 맞춰 수정해주세요

export class WorksController extends BaseController {
  #worksService;

  constructor({ worksService }) {
    super();
    this.#worksService = worksService;
  }

  routes() {
    // 1. 작업물 생성
    this.router.post(
      '/',
      needsLogin,
      validate('body', createWorkSchema),
      (req, res, next) => this.createWork(req, res, next),
    );

    // 2. 작업물 상세 조회
    this.router.get(
      '/:id',
      validate('params', workIdParamSchema),
      (req, res, next) => this.getWorkDetail(req, res, next),
    );

    // 3. 작업물 수정
    this.router.patch(
      '/:id',
      needsLogin,
      validate('params', workIdParamSchema),
      validate('body', updateWorkSchema),
      (req, res, next) => this.updateWork(req, res, next),
    );

    // 4. 작업물 삭제
    this.router.delete(
      '/:id',
      needsLogin,
      validate('params', workIdParamSchema),
      (req, res, next) => this.deleteWork(req, res, next),
    );

    return this.router;
  }

  async createWork(req, res, next) {
    try {
      const { challengeId, ...data } = req.body;
      const work = await this.#worksService.createWork(
        req.user.id,
        challengeId,
        data,
      );

      res.status(HTTP_STATUS.CREATED).json(work);
    } catch (error) {
      next(error);
    }
  }

  async getWorkDetail(req, res, next) {
    try {
      const work = await this.#worksService.getWorkDetail(req.params.id);

      res.status(HTTP_STATUS.OK).json(work);
    } catch (error) {
      next(error);
    }
  }

  async updateWork(req, res, next) {
    try {
      const work = await this.#worksService.updateWork(
        req.params.id,
        req.user.id,
        req.body,
      );

      res.status(HTTP_STATUS.OK).json(work);
    } catch (error) {
      next(error);
    }
  }

  async deleteWork(req, res, next) {
    try {
      await this.#worksService.deleteWork(req.params.id, req.user.id);

      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}
