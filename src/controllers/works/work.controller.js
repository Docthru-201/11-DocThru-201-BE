import { BaseController } from '#controllers/base.controller.js';
import { SUCCESS_MESSAGE, HTTP_STATUS } from '#constants';
import { Router } from 'express';
import {
  adminValidator,
  auditAdminAction,
  validate,
  needsLogin,
} from '#middlewares';
import { workListQuerySchema } from './dto/work.dto.js';

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
      adminValidator,
      auditAdminAction,
      validate('query', workListQuerySchema),
      (req, res, next) => this.getAllWorks(req, res, next),
    );
    this.router.post('/', needsLogin, (req, res, next) =>
      this.createWork(req, res, next),
    );
    this.router.get('/my', needsLogin, (req, res, next) =>
      this.getMyWork(req, res, next),
    );
    this.router.get('/:id', needsLogin, (req, res, next) =>
      this.getWorkById(req, res, next),
    );
    this.router.patch('/:id', needsLogin, (req, res, next) =>
      this.updateWork(req, res, next),
    );
    this.router.delete('/:id', needsLogin, (req, res, next) =>
      this.deleteWork(req, res, next),
    );
    return this.router;
  }

  async getAllWorks(req, res) {
    const userId = req.user?.userId ?? req.user?.id;
    const { id: challengeId } = req.params;
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

  async createWork(req, res, next) {
    try {
      const { id: challengeId } = req.params;
      const userId = req.user.id;
      const newWork = await this.#worksService.createWork(challengeId, userId);

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGE.WORK_CREATED,
        data: newWork,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const work = await this.#worksService.getWorkById(id, userId);
      res.status(HTTP_STATUS.OK).json(work);
    } catch (error) {
      next(error);
    }
  }

  async updateWork(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { content, action, title } = req.body;
      const updated = await this.#worksService.updateWork(id, userId, {
        content,
        action,
        title,
      });
      res.status(HTTP_STATUS.OK).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async getMyWork(req, res, next) {
    try {
      const { id: challengeId } = req.params;
      const userId = req.user?.id;
      const work = await this.#worksService.getMyWork(challengeId, userId);
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

export default WorksController;
