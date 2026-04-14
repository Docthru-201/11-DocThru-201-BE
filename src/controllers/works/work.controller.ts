import type { Request, Response, NextFunction } from 'express';
import { BaseController } from '#controllers/base.controller.js';
import { SUCCESS_MESSAGE, HTTP_STATUS } from '#constants';
import { Router } from 'express';
import { validate, needsLogin } from '#middlewares';
import { workListQuerySchema } from './dto/work.dto.js';
import type { WorksService } from '#services';

export class WorksController extends BaseController {
  #worksService: WorksService;

  constructor({ worksService }: { worksService: WorksService }) {
    super();
    this.router = Router({ mergeParams: true });
    this.#worksService = worksService;
  }

  routes() {
    /** 챌린지 상세 참여현황 — 공개 조회(로그인 시 좋아요 여부만 채움) */
    this.router.get('/', validate('query', workListQuerySchema), (req, res) =>
      this.getAllWorks(req, res),
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

  async getAllWorks(req: Request, res: Response) {
    const userId = req.user?.userId ?? req.user?.id;
    const challengeId = req.params.id as string;
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

  async createWork(req: Request, res: Response, next: NextFunction) {
    try {
      const challengeId = req.params.id as string;
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

  async getWorkById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.user?.id;
      const work = await this.#worksService.getWorkById(id, userId);
      res.status(HTTP_STATUS.OK).json(work);
    } catch (error) {
      next(error);
    }
  }

  async updateWork(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
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

  async getMyWork(req: Request, res: Response, next: NextFunction) {
    try {
      const challengeId = req.params.id as string;
      const userId = req.user?.id;
      const work = await this.#worksService.getMyWork(challengeId, userId);
      res.status(HTTP_STATUS.OK).json(work);
    } catch (error) {
      next(error);
    }
  }

  async deleteWork(req: Request, res: Response, next: NextFunction) {
    try {
      await this.#worksService.deleteWork(req.params.id as string, req.user.id);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}

export default WorksController;
