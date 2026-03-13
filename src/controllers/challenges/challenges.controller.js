import { BaseController } from '#controllers/base.controller.js';

export class ChallengesController extends BaseController {
  #challengesService;

  constructor({ challengesService }) {
    super();
    this.#challengesService = challengesService;
  }

  routes() {
    return this.router;
  }

  async findAll(req, res) {}

  async findById(req, res) {}

  async create(req, res) {}

  async update(req, res) {}

  async delete(req, res) {}

  async getMyChallenges(req, res) {}
}
