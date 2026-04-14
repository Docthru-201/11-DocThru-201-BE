import type { Request, Response } from 'express';
import { HTTP_STATUS } from '#constants';
import { BaseController } from '#controllers/base.controller.js';
import { needsLogin, validate } from '#middlewares';
import type { NotificationsService } from '#services';
import {
  createNotificationSchema,
  getMyNotificationsQuerySchema,
  notificationIdParamSchema,
  readNotificationSchema,
} from './dto/notification.dto.js';

export class NotificationsController extends BaseController {
  #notificationsService: NotificationsService;

  constructor({
    notificationsService,
  }: {
    notificationsService: NotificationsService;
  }) {
    super();
    this.#notificationsService = notificationsService;
  }

  routes() {
    this.router.get(
      //notifications/me
      '/me',
      needsLogin,
      validate('query', getMyNotificationsQuerySchema),
      (req, res) => this.listMy(req, res),
    );

    this.router.post(
      //notifications
      '/',
      needsLogin,
      validate('body', createNotificationSchema),
      (req, res) => this.create(req, res),
    );

    this.router.delete(
      // notifications/me/:id
      '/me/:id',
      needsLogin,
      validate('params', notificationIdParamSchema),
      (req, res) => this.deleteMy(req, res),
    );

    this.router.patch(
      // notifications/me/:id
      '/me/:id',
      needsLogin,
      validate('params', notificationIdParamSchema),
      validate('body', readNotificationSchema),
      (req, res) => this.markAsRead(req, res),
    );

    return this.router;
  }

  async create(req: Request, res: Response) {
    const { userId, message, targetId, targetUrl } = req.body;
    const notification = await this.#notificationsService.createNotification({
      actorId: req.user.id,
      userId,
      message,
      targetId,
      targetUrl,
    });
    res.status(HTTP_STATUS.CREATED).json(notification);
  }

  async listMy(req: Request, res: Response) {
    const { page, limit, targetType } = req.query;
    const notifications = await this.#notificationsService.listMyNotifications({
      userId: req.user.id,
      page,
      limit,
      targetType,
    });
    res.status(HTTP_STATUS.OK).json(notifications);
  }

  async deleteMy(req: Request, res: Response) {
    const id = req.params.id as string;
    await this.#notificationsService.deleteMyNotification({
      userId: req.user.id,
      notificationId: id,
    });
    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }

  async markAsRead(req: Request, res: Response) {
    const id = req.params.id as string;
    const { isRead } = req.body;
    const updated = await this.#notificationsService.markAsRead({
      userId: req.user.id,
      notificationId: id,
      isRead,
    });
    res.status(HTTP_STATUS.OK).json(updated);
  }
}
