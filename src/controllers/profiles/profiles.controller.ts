import type { Request, Response } from 'express';
import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin } from '#middlewares';
import { userIdParamSchema } from '#controllers/users/dto/user.dto.js';
import { updateProfileSchema } from './dto/profiles.dto.js';
import type { ProfilesService } from '#services';

export class ProfilesController extends BaseController {
  #profilesService: ProfilesService;

  constructor({ profilesService }: { profilesService: ProfilesService }) {
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

  async getMyProfile(req: Request, res: Response) {
    const profile = await this.#profilesService.getMyProfile(req.user.id);

    res.status(HTTP_STATUS.OK).json(profile);
  }

  async updateProfile(req: Request, res: Response) {
    const profile = await this.#profilesService.updateProfile(
      req.user.id,
      req.body,
    );

    res.status(HTTP_STATUS.OK).json(profile);
  }

  async getProfileByUserId(req: Request, res: Response) {
    const profile = await this.#profilesService.getProfileByUserId(
      req.params.userId as string,
    );

    res.status(HTTP_STATUS.OK).json(profile);
  }
}
