import { BaseController } from '#controllers/base.controller.js';
import { SUCCESS_MESSAGE, HTTP_STATUS } from '#constants';
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
    this.router.post('/', (req, res, next) =>
      this.createWork(req, res, next),
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

  createWork = async (req, res) => {
    const { challengeId } = req.params;
    const userId = req.user?.userId;  //토큰 결합시 재확인 필요

    const newWork = await this.#worksService.createWork(
      challengeId,
      userId,
    );
   
    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGE.WORK_CREATED,
      data: newWork,
    });
  };

  async create(req, res) {}

  async findById(req, res) {}

  async update(req, res) {}

  async delete(req, res) {}
}

export default WorksController;
