import { BaseController } from '#controllers/base.controller.js';

export class ParticipantsController extends BaseController {
  #participantsService;

  constructor({ participantsService }) {
    super();
    this.#participantsService = participantsService;
  }

  routes() {
    return this.router;
  }

  async listParticipants(req, res) {}
}
