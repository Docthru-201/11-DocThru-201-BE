import type { Request, Response } from 'express';
import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { adminValidator, auditAdminAction, validate } from '#middlewares';
import type { ChallengesService } from '#services';
import {
  getAllChallengesScheme,
  updateChallengeStatusScheme,
} from './dto/admin.dto.js';
export class AdminController extends BaseController {
  #challengesService: ChallengesService;

  constructor({ challengesService }: { challengesService: ChallengesService }) {
    super();
    this.#challengesService = challengesService;
  }

  routes() {
    this.router.get(
      '/challenges',
      adminValidator,
      auditAdminAction,
      validate('query', getAllChallengesScheme),
      (req, res) => this.getAllChallenges(req, res),
    );
    this.router.get(
      '/challenges/:challengeId',
      adminValidator,
      auditAdminAction,
      (req, res) => this.getChallengeDetailById(req, res),
    );
    this.router.patch(
      '/challenges/:challengeId',
      adminValidator,
      auditAdminAction,
      validate('params', updateChallengeStatusScheme.params),
      validate('body', updateChallengeStatusScheme.body),
      (req, res) => this.updateChallengeStatus(req, res),
    );

    return this.router;
  }

  async getAllChallenges(req: Request, res: Response) {
    const { page, pageSize, sort, keyword } = req.query;
    const result = await this.#challengesService.getAllChallenges({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      sort: sort as string | undefined,
      keyword: keyword as string | undefined,
      actor: req.user,
    });

    res.status(HTTP_STATUS.OK).json(result);
  }

  async getChallengeDetailById(req: Request, res: Response) {
    const challengeId = req.params.challengeId as string;
    const result = await this.#challengesService.getChallengeDetailById(
      challengeId,
      req.user,
    );

    if (!result) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: '해당 챌린지를 찾을 수 없습니다.' });
    }

    res.status(HTTP_STATUS.OK).json(result);
  }

  async updateChallengeStatus(req: Request, res: Response) {
    const challengeId = req.params.challengeId as string;
    const data = req.body;

    const result = await this.#challengesService.updateChallengeStatus(
      challengeId,
      data,
      req.user,
    );

    res.status(HTTP_STATUS.OK).json({ result });
  }
}
