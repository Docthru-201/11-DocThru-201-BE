import { BaseController } from '#controllers/base.controller.js';
import { ERROR_MESSAGE, SUCCESS_MESSAGE, HTTP_STATUS } from '#constants';
import { Router } from 'express';
import { adminValidator } from '#middlewares';
export class WorksController extends BaseController {
  #worksService;

  constructor({ worksService }) {
    super();
    this.router = Router({ mergeParams: true });
    this.#worksService = worksService;
  }

  routes() {
    this.router.get('/', adminValidator, (req, res, next) =>
      this.getAllWorks(req, res, next),
    );
    // 임시로 adminValidator -> verifyAccessToken 확인필요
    this.router.post('/', (req, res, next) => this.createWork(req, res, next));

    this.router.get('/:id', (req, res, next) =>
      this.getWorkById(req, res, next),
    );
    this.router.patch('/:id', (req, res, next) =>
      this.updateWork(req, res, next),
    );
    this.router.delete('/:id', (req, res, next) =>
      this.deleteWork(req, res, next),
    );

    return this.router;
  }

  async getAllWorks(req, res) {
    const userId = req.user?.userId;
    const { challengeId } = req.params;
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

  createWork = async (req, res, next) => {
    try {
      const { challengeId } = req.params;
      const participantId = req.user?.userId; // 인증 붙이면 이걸로
      const newWork = await this.#worksService.createWork(
        challengeId,
        participantId,
      );
      return res.status(HTTP_STATUS.CREATED).json(newWork);
    } catch (error) {
      next(error);
    }
  };

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
