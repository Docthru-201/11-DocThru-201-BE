import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin, needsAdmin } from '#middlewares';
import {
  createChallengeSchema,
  challengeIdParamSchema,
  updateChallengeSchema,
} from './dto/challenge.dto.js';

export class ChallengesController extends BaseController {
  #challengesService;

  constructor({ challengesService }) {
    super();
    this.#challengesService = challengesService;
  }

  routes() {
    this.router.get('/', (req, res) => this.findAll(req, res));

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

    this.router.get('/me', needsLogin, (req, res) =>
      this.getMyChallenges(req, res),
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

    const myChallenges =
      await this.#challengesService.getChallengesByUser(userId);
    res.status(HTTP_STATUS.OK).json(myChallenges);
  }
}
