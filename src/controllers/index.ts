import type { Request, Response } from 'express';
import { format } from 'date-fns';
import { BaseController } from './base.controller.js';
import type { AuthController } from './auth/index.js';
import type { UsersController } from './users/index.js';
import type { ProfilesController } from './profiles/index.js';
import type { ChallengesController } from './challenges/index.js';
import type { ParticipantsController } from './participants/index.js';
import type { WorksController } from './works/index.js';
import type { CommentsController } from './comments/index.js';
import type { LikesController } from './likes/index.js';
import type { NotificationsController } from './notifications/index.js';
import type { AdminController } from './admin/index.js';

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
  #authController: AuthController;
  #usersController: UsersController;
  #profilesController: ProfilesController;
  #challengesController: ChallengesController;
  #participantsController: ParticipantsController;
  #worksController: WorksController;
  #commentsController: CommentsController;
  #likesController: LikesController;
  #notificationsController: NotificationsController;
  #adminController: AdminController;

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
  }: {
    authController: AuthController;
    usersController: UsersController;
    profilesController: ProfilesController;
    challengesController: ChallengesController;
    participantsController: ParticipantsController;
    worksController: WorksController;
    commentsController: CommentsController;
    likesController: LikesController;
    notificationsController: NotificationsController;
    adminController: AdminController;
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

  ping(req: Request, res: Response) {
    const time = new Date();
    const formattedTime = format(time, 'yyyy-MM-dd HH:mm:ss');
    const message = `현재 시간: ${formattedTime}`;
    res.status(200).json({ message });
  }
}
