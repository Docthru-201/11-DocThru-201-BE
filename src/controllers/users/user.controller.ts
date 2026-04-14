import type { Request, Response } from 'express';
import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin } from '#middlewares';
import { updateUserSchema, userIdParamSchema } from './dto/user.dto.js';
import type { UsersService, StatsService, WorksService } from '#services';
import type { ProfilesController } from '#controllers';

export class UsersController extends BaseController {
  #usersService: UsersService;
  #profilesController: ProfilesController;
  #statsService: StatsService;
  #worksService: WorksService;

  constructor({
    usersService,
    profilesController,
    statsService,
    worksService,
  }: {
    usersService: UsersService;
    profilesController: ProfilesController;
    statsService: StatsService;
    worksService: WorksService;
  }) {
    super();
    this.#usersService = usersService;
    this.#profilesController = profilesController;
    this.#statsService = statsService;
    this.#worksService = worksService;
  }

  routes() {
    this.router.get('/me', needsLogin, (req, res) => this.getMe(req, res));
    this.router.get('/me/stats', needsLogin, (req, res) =>
      this.getMyStats(req, res),
    );
    this.router.get('/me/works', needsLogin, (req, res) =>
      this.getMyWorks(req, res),
    );
    this.router.patch(
      '/me',
      needsLogin,
      validate('body', updateUserSchema),
      (req, res) => this.updateMe(req, res),
    );
    this.router.delete('/me', needsLogin, (req, res) =>
      this.deleteMe(req, res),
    );
    this.router.get(
      '/:userId',
      validate('params', userIdParamSchema),
      (req, res) => this.getUserById(req, res),
    );
    this.router.use('/', this.#profilesController.routes());
    return this.router;
  }

  async getMe(req: Request, res: Response) {
    const user = await this.#usersService.getUserById(req.user.id);
    res.status(HTTP_STATUS.OK).json(user);
  }

  async updateMe(req: Request, res: Response) {
    const updatedUser = await this.#usersService.updateUser(
      req.user.id,
      req.body,
    );
    res.status(HTTP_STATUS.OK).json(updatedUser);
  }

  async deleteMe(req: Request, res: Response) {
    await this.#usersService.deleteUser(req.user.id);
    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }

  async getUserById(req: Request, res: Response) {
    const user = await this.#usersService.getPublicProfile(
      req.params.userId as string,
    );
    res.status(HTTP_STATUS.OK).json(user);
  }

  async getMyStats(req: Request, res: Response) {
    const stats = await this.#statsService.getMyStats(req.user.id);
    res.status(HTTP_STATUS.OK).json(stats);
  }

  async getMyWorks(req: Request, res: Response) {
    const works = await this.#worksService.getMyWorks(req.user.id);
    res.status(HTTP_STATUS.OK).json(works);
  }
}
