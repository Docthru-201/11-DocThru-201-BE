import { BaseController } from '#controllers/base.controller.js';

export class ProfilesController extends BaseController {
  #profilesService;

  constructor({ profilesService }) {
    super();
    this.#profilesService = profilesService;
  }

  routes() {}

  async getMyProfile(req, res) {}

  async updateMyProfile(req, res) {}

  async getUserProfile(req, res) {}
}
