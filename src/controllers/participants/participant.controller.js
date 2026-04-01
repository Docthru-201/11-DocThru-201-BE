import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { needsLogin, validate } from '#middlewares';
import { participantParamsSchema } from './dto/participant.dto.js';
import express from 'express';

export class ParticipantsController extends BaseController {
  #participantsService;

  constructor({ participantsService }) {
    super();
    this.#participantsService = participantsService;
    this.router = express.Router({ mergeParams: true });
  }

  routes() {
    // POST /challenges/:challengeId/participants
    this.router.post(
      '/:challengeId/applications',
      needsLogin,
      validate('params', participantParamsSchema), // URL 파라미터 검증
      (req, res) => this.create(req, res),
    );

    return this.router;
  }

  async create(req, res) {
    const { challengeId } = req.params;
    const userId = req.user.id;

    const result = await this.#participantsService.joinChallenge(
      challengeId,
      userId,
    );

    res.status(HTTP_STATUS.CREATED).json(result);
  }
}
