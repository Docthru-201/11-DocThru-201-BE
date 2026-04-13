import { format } from 'date-fns';
import { BaseController } from './base.controller.js';

export * from './auth/index.js';
export * from './users/index.js';
export * from './profiles/index.js';
export * from './challenges/index.js';
export * from './participants/index.js';
export * from './works/index.js';
export * from './comments/index.js';
export * from './likes/index.js';
export * from './notifications/index.js';
export * from './admin/index.js';

export class Controller extends BaseController {
  #authController;
  #usersController;
  #profilesController;
  #challengesController;
  #participantsController;
  #worksController;
  #commentsController;
  #likesController;
  #notificationsController;
  #adminController;

  constructor({
    authController,
    usersController,
    profilesController,
    challengesController,
    participantsController,
    worksController,
    commentsController,
    likesController,
    notificationsController,
    adminController,
  }) {
    super();
    this.#authController = authController;
    this.#usersController = usersController;
    this.#profilesController = profilesController;
    this.#challengesController = challengesController;
    this.#participantsController = participantsController;
    this.#worksController = worksController;
    this.#commentsController = commentsController;
    this.#likesController = likesController;
    this.#notificationsController = notificationsController;
    this.#adminController = adminController;
  }

  routes() {
    this.router.use('/auth', this.#authController.routes());
    this.router.use('/users', this.#usersController.routes());
    this.router.use('/users', this.#profilesController.routes());
    this.router.use('/challenges', this.#participantsController.routes());
    this.router.use('/challenges', this.#challengesController.routes());
    this.router.use('/works', this.#worksController.routes());
    this.router.use('/works', this.#commentsController.routes());
    this.router.use('/works', this.#likesController.routes());
    this.router.use('/comments', this.#commentsController.routes());
    this.router.use('/notifications', this.#notificationsController.routes());
    this.router.use('/admin', this.#adminController.routes());

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
