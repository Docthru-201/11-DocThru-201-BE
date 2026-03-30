import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin, needsAdmin } from '#middlewares';
import {
  createChallengeSchema,
  challengeIdParamSchema,
  updateChallengeSchema,
  myChallengesQuerySchema,
} from './dto/challenge.dto.js';

export class ChallengesController extends BaseController {
  #challengesService;
  #worksController;

  constructor({ challengesService, worksController }) {
    super();
    this.#challengesService = challengesService;
    this.#worksController = worksController;
  }

  routes() {
    this.router.use('/:id/works', this.#worksController.routes());
    // 전체 목록 조회 (커서 기반 페이지네이션)
    this.router.get('/', (req, res) => this.findAll(req, res));

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
      validate('params', challengeIdParamSchema),
      (req, res) => this.delete(req, res),
    );

    return this.router;
  }

  async findAll(req, res) {
    const challenges = await this.#challengesService.listChallenges(req.query);
    res.status(HTTP_STATUS.OK).json(challenges);
  }
  // Parameter통일 필요(id -> challengeId로 swlee)
  async findById(req, res) {
    const { id : challengeId } = req.params;
    const challenge =
      await this.#challengesService.getChallengeDetail(challengeId);
    res.status(HTTP_STATUS.OK).json(challenge);
  }

  async create(req, res) {
    const challengeData = req.body;
    const userId = req.user.id;

    const newChallenge = await this.#challengesService.createChallenge({
      ...challengeData,
      authorId: userId,
    });
    res.status(HTTP_STATUS.CREATED).json(newChallenge);
  }

  async update(req, res) {
    const { id } = req.params;
    const updateData = req.body;
    const updateChallenge = await this.#challengesService.updateChallenge(
      id,
      updateData,
    );
    res.status(HTTP_STATUS.OK).json(updateChallenge);
  }

  async delete(req, res) {
    const { id } = req.params;

    await this.#challengesService.deleteChallenge(id);
    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }

  async getMyChallenges(req, res) {
    const userId = req.user.id;
    const { tab } = req.query;

    const payload = await this.#challengesService.getMyChallengesForTabs(
      userId,
      tab,
    );
    res.status(HTTP_STATUS.OK).json(payload);
  }
}
