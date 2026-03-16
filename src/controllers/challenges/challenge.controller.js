import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin } from '#middlewares';
import {
  createChallengeSchema,
  idParamSchema,
  updateChallengeSchema,
} from './dto/challenge.dto.js';

export class ChallengesController extends BaseController {
  #challengesService;

  constructor({ challengesService }) {
    super();
    this.#challengesService = challengesService;
  }

  routes() {
    this.router.get('/me', needsLogin, (req, res) =>
      this.getMyChallenges(req, res),
    );

    this.router.get('/', (req, res) => this.findAll(req, res));

    this.router.post(
      '/',
      needsLogin,
      validate('body', createChallengeSchema),
      (req, res) => this.create(req, res),
    );

    this.router.patch(
      '/:id',
      needsLogin,
      validate('params', idParamSchema),
      validate('body', updateChallengeSchema),
      (req, res) => this.update(req, res),
    );

    this.router.delete(
      '/:id',
      needsLogin,
      validate('params', idParamSchema),
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

  async create(req, res) {}

  async update(req, res) {}

  async delete(req, res) {}

  async getMyChallenges(req, res) {}
}
