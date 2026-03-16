import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin } from '#middlewares';
import { updateUserSchema } from './dto/user.dto.js';
import { z } from 'zod';

const idParamSchema = z.object({
  id: z.string().uuid(),
});

export class UsersController extends BaseController {
  #usersService;
  #profilesController;

  constructor({ usersService, profilesController }) {
    super();
    this.#usersService = usersService;
    this.#profilesController = profilesController;
  }

  routes() {
    this.router.get('/me', needsLogin, (req, res) => this.getMe(req, res));
    this.router.patch(
      '/me',
      needsLogin,
      validate('body', updateUserSchema),
      (req, res) => this.updateMe(req, res),
    );
    this.router.delete('/me', needsLogin, (req, res) =>
      this.deleteMe(req, res),
    );
    this.router.get('/:id', validate('params', idParamSchema), (req, res) =>
      this.getUserById(req, res),
    );
    this.router.use('/', this.#profilesController.routes());
    return this.router;
  }

  async getMe(req, res) {
    const user = await this.#usersService.getUserById(req.user.id);
    res.status(HTTP_STATUS.OK).json(user);
  }

  async updateMe(req, res) {
    const updatedUser = await this.#usersService.updateUser(
      req.user.id,
      req.body,
    );
    res.status(HTTP_STATUS.OK).json(updatedUser);
  }

  async deleteMe(req, res) {
    await this.#usersService.deleteUser(req.user.id);
    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }

  async getUserById(req, res) {
    const user = await this.#usersService.getPublicProfile(req.params.id);
    res.status(HTTP_STATUS.OK).json(user);
  }
}
