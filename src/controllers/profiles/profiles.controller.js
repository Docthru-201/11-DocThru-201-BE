import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin } from '#middlewares';
import { updateProfileSchema } from './dto/profiles.dto.js';
import { z } from 'zod';

const userIdParamSchema = z.object({
  userId: z.string(),
});

export class ProfilesController extends BaseController {
  #profilesService;

  constructor({ profilesService }) {
    super();
    this.#profilesService = profilesService;
  }

  routes() {
    this.router.get('/me/profile', needsLogin, (req, res) =>
      this.getMyProfile(req, res),
    );

    this.router.patch(
      '/me/profile',
      needsLogin,
      validate('body', updateProfileSchema),
      (req, res) => this.updateProfile(req, res),
    );

    this.router.get(
      '/:userId/profile',
      validate('params', userIdParamSchema),
      (req, res) => this.getProfileByUserId(req, res),
    );

    return this.router;
  }

  async getMyProfile(req, res) {
    const profile = await this.#profilesService.getMyProfile(req.user.id);

    res.status(HTTP_STATUS.OK).json(profile);
  }

  async updateProfile(req, res) {
    const profile = await this.#profilesService.updateProfile(
      req.user.id,
      req.body,
    );

    res.status(HTTP_STATUS.OK).json(profile);
  }

  async getProfileByUserId(req, res) {
    const profile = await this.#profilesService.getProfileByUserId(
      req.params.userId,
    );

    res.status(HTTP_STATUS.OK).json(profile);
  }
}
