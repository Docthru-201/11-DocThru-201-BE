import { BaseController } from '#controllers/base.controller.js';

export class ParticipantsController extends BaseController {
  #participantsService;

  constructor({ participantsService }) {
    super();
    this.#participantsService = participantsService;
  }

  routes() {}

  async listParticipants(req, res) {}
}

