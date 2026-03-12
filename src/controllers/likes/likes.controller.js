import { BaseController } from '#controllers/base.controller.js';

export class LikesController extends BaseController {
  #likesService;

  constructor({ likesService }) {
    super();
    this.#likesService = likesService;
  }

  routes() {}

  async count(req, res) {}

  async me(req, res) {}

  async like(req, res) {}

  async unlike(req, res) {}
}
