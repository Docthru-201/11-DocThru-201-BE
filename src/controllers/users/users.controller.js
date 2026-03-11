import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin } from '#middlewares';
import {
  createUserSchema,
  idParamSchema,
  updateUserSchema,
} from './dto/users.dto.js';

export class UsersController extends BaseController {
  #usersService;

  constructor({ usersService }) {
    super();
    this.#usersService = usersService;
  }

  routes() {
    this.router.get('/', (req, res) => this.findAll(req, res));
    this.router.get('/:id', validate('params', idParamSchema), (req, res) =>
      this.findById(req, res),
    );
    this.router.post('/', validate('body', createUserSchema), (req, res) =>
      this.create(req, res),
    );
    this.router.patch(
      '/:id',
      needsLogin,
      validate('params', idParamSchema),
      validate('body', updateUserSchema),
      (req, res) => this.update(req, res),
    );
    this.router.delete(
      '/:id',
      needsLogin,
      validate('params', idParamSchema),
      (req, res) => this.delete(req, res),
    );
    return this.router;
  }

  async findAll(req, res) {
    const users = await this.#usersService.listUsers();
    res.status(HTTP_STATUS.OK).json(users);
  }

  async findById(req, res) {
    const { id } = req.params;
    const user = await this.#usersService.getUserDetail(id);
    res.status(HTTP_STATUS.OK).json(user);
  }

  async create(req, res) {
    const { email, password, name } = req.body;
    const newUser = await this.#usersService.registerUser({
      email,
      password,
      name,
    });
    res.status(HTTP_STATUS.CREATED).json(newUser);
  }

  async update(req, res) {
    const { id } = req.params;
    const { email, name } = req.body;
    const updatedUser = await this.#usersService.changeProfile(
      id,
      req.user.id,
      {
        email,
        name,
      },
    );
    res.status(HTTP_STATUS.OK).json(updatedUser);
  }

  async delete(req, res) {
    const { id } = req.params;
    await this.#usersService.deleteAccount(id, req.user.id);
    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }
}
