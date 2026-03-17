import { HTTP_STATUS } from '#constants';
import { BaseController } from '#controllers/base.controller.js';
import { needsLogin, validate } from '#middlewares';
import {
  challengeIdParamSchema,
  listChallengesQuerySchema,
  createChallengeSchema,
  updateChallengeSchema,
} from './dto/challenge.dto.js';

export class ChallengesController extends BaseController {
  #challengesService;

  constructor({ challengesService }) {
    super();
    this.#challengesService = challengesService;
  }

  routes() {
    this.router.get(
      '/',
      validate('query', listChallengesQuerySchema),
      (req, res) => this.findAll(req, res),
    );

    this.router.get('/me', needsLogin, (req, res) =>
      this.getMyChallenges(req, res),
    );

    this.router.get(
      '/:id',
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
      validate('params', challengeIdParamSchema),
      validate('body', updateChallengeSchema),
      (req, res) => this.update(req, res),
    );

    this.router.delete(
      '/:id',
      needsLogin,
      validate('params', challengeIdParamSchema),
      (req, res) => this.delete(req, res),
    );

    return this.router;
  }

  async findAll(req, res) {
    const challenges = await this.#challengesService.listChallenges(req.query);
    res.status(HTTP_STATUS.OK).json(challenges);
  }

  async findById(req, res) {
    const { id } = req.params;
    const challenge = await this.#challengesService.getChallengeDetail(id);
    res.status(HTTP_STATUS.OK).json(challenge);
  }

  async create(req, res) {
    const newChallenge = await this.#challengesService.createChallenge(
      req.user.id,
      req.body,
    );
    res.status(HTTP_STATUS.CREATED).json(newChallenge);
  }
  async update(req, res) {
    const { id } = req.params;
    const updated = await this.#challengesService.updateChallenge(
      id,
      req.user.id,
      req.body,
    );
    res.status(HTTP_STATUS.OK).json(updated);
  }

  async delete(req, res) {
    const { id } = req.params;
    await this.#challengesService.deleteChallenge(id, req.user.id);
    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }

  async getMyChallenges(req, res) {
    const challenges = await this.#challengesService.listMyChallenges(
      req.user.id,
    );
    res.status(HTTP_STATUS.OK).json(challenges);
  }
}
