import type { Request, Response } from 'express';
import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import {
  validate,
  needsLogin,
  needsAdmin,
  auditAdminAction,
} from '#middlewares';
import type { ChallengesService } from '#services';
import type { WorksController } from '#controllers';
import {
  createChallengeSchema,
  challengeIdParamSchema,
  listChallengesQuerySchema,
  updateChallengeSchema,
  myChallengesQuerySchema,
} from './dto/challenge.dto.js';

export class ChallengesController extends BaseController {
  #challengesService: ChallengesService;
  #worksController: WorksController;

  constructor({
    challengesService,
    worksController,
  }: {
    challengesService: ChallengesService;
    worksController: WorksController;
  }) {
    super();
    this.#challengesService = challengesService;
    this.#worksController = worksController;
  }

  routes() {
    this.router.use('/:id/works', this.#worksController.routes());
    // 전체 목록 조회 (커서 기반 페이지네이션)
    this.router.get(
      '/',
      validate('query', listChallengesQuerySchema),
      (req, res) => this.findAll(req, res),
    );

    // `/:challengeId` 보다 먼저 등록 (그렇지 않으면 "me"가 id로 매칭됨)
    this.router.get(
      '/me',
      needsLogin,
      validate('query', myChallengesQuerySchema),
      (req, res) => this.getMyChallenges(req, res),
    );

    this.router.get(
      '/:id',
      needsLogin,
      validate('params', challengeIdParamSchema),
      (req, res) => this.findById(req, res),
    );

    this.router.post(
      '/',
      needsLogin,
      validate('body', createChallengeSchema),
      (req, res) => this.create(req, res),
    );

    this.router.patch(
      '/:id',
      needsLogin,
      needsAdmin,
      validate('params', challengeIdParamSchema),
      validate('body', updateChallengeSchema),
      (req, res) => this.update(req, res),
    );

    this.router.delete(
      '/:id',
      needsLogin,
      needsAdmin,
      auditAdminAction,
      validate('params', challengeIdParamSchema),
      (req, res) => this.delete(req, res),
    );

    return this.router;
  }

  async findAll(req: Request, res: Response) {
    const challenges = await this.#challengesService.listChallenges(req.query);
    res.status(HTTP_STATUS.OK).json(challenges);
  }
  // Parameter통일 필요(id -> challengeId로 swlee)
  async findById(req: Request, res: Response) {
    const challengeId = req.params.id as string;
    const challenge =
      await this.#challengesService.getChallengeDetail(challengeId);
    res.status(HTTP_STATUS.OK).json(challenge);
  }

  async create(req: Request, res: Response) {
    const challengeData = req.body;
    const userId = req.user.id;

    const newChallenge = await this.#challengesService.createChallenge({
      ...challengeData,
      authorId: userId,
    });
    res.status(HTTP_STATUS.CREATED).json(newChallenge);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const updateData = req.body;
    const updateChallenge = await this.#challengesService.updateChallenge(
      id,
      updateData,
      req.user,
    );
    res.status(HTTP_STATUS.OK).json(updateChallenge);
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;

    await this.#challengesService.deleteChallenge(id, req.user);
    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }

  async getMyChallenges(req: Request, res: Response) {
    const userId = req.user.id;
    const tab = req.query.tab as string | undefined;

    const payload = await this.#challengesService.getMyChallengesForTabs(
      userId,
      tab,
    );
    res.status(HTTP_STATUS.OK).json(payload);
  }
}
