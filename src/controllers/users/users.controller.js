import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin } from '#middlewares';
import { updateUserSchema } from './dto/users.dto.js';
import { z } from 'zod';

const idParamSchema = z.object({
  id: z.string().uuid(),
});

export class UsersController extends BaseController {
  #usersService;

  constructor({ usersService }) {
    super();
    this.#usersService = usersService;
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

    return this.router;
  }

  async getMe(req, res) {
    const user = await this.#usersService.getMyInfo(req.user.id);
    res.status(HTTP_STATUS.OK).json(user);
  }

  async updateMe(req, res) {
    const updatedUser = await this.#usersService.updateMyInfo(
      req.user.id,
      req.body,
    );
    res.status(HTTP_STATUS.OK).json(updatedUser);
  }

  async deleteMe(req, res) {
    await this.#usersService.deleteMyAccount(req.user.id);
    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }

  async getUserById(req, res) {
    const user = await this.#usersService.getUserBasicInfo(req.params.id);
    res.status(HTTP_STATUS.OK).json(user);
  }
}
