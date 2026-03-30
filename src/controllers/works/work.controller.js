import { BaseController } from '#controllers/base.controller.js';
import { SUCCESS_MESSAGE, HTTP_STATUS } from '#constants';
import { Router } from 'express';
import { validate, needsLogin } from '#middlewares';
import { challengeIdParamSchema } from './../challenges/dto/challenge.dto.js';

export class WorksController extends BaseController {
  #worksService;

  constructor({ worksService }) {
    super();
    this.router = Router({ mergeParams: true });
    this.#worksService = worksService;
  }

  routes() {
    this.router.get(
      '/',
      needsLogin,
      validate('params', challengeIdParamSchema),
      (req, res, next) => this.getAllWorks(req, res, next),
    );

    this.router.post(
      '/',
      needsLogin,
      validate('params', challengeIdParamSchema),
      (req, res, next) => this.createWork(req, res, next),
    );
    return this.router;
  }

  async getAllWorks(req, res) {
    const userId = req.user?.id;
    const { id : challengeId } = req.params;
    const { page = 1, pageSize = 5 } = req.query;
    const works = await this.#worksService.getAllWorks(
      userId,
      challengeId,
      Number(page),
      Number(pageSize),
    );

    res.status(HTTP_STATUS.OK).json({
      data: works,
      pagination: {
        page: page,
        pageSize: pageSize,
      },
    });
  }

  async createWork(req, res) {
    const { id: challengeId } = req.params;
    const userId = req.user.id;
    const newWork = await this.#worksService.createWork(challengeId, userId);

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGE.WORK_CREATED,
      data: newWork,
    });
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

export default WorksController;
