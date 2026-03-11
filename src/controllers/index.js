import { format } from 'date-fns';
import { BaseController } from './base.controller.js';

export * from './auth/index.js';
export * from './users/index.js';

export class Controller extends BaseController {
  #authController;
  #usersController;

  constructor({ authController, usersController }) {
    super();
    this.#authController = authController;
    this.#usersController = usersController;
  }

  routes() {
    this.router.use('/auth', this.#authController.routes());
    this.router.use('/users', this.#usersController.routes());

    this.router.get('/ping', (req, res) => this.ping(req, res));

    return this.router;
  }

  ping(req, res) {
    const time = new Date();
    const formattedTime = format(time, 'yyyy-MM-dd HH:mm:ss');
    const message = `현재 시간: ${formattedTime}`;
    res.status(200).json({ message });
  }
}
