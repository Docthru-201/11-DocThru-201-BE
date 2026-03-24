import { HTTP_STATUS } from '#constants';
import { BaseController } from '#controllers/base.controller.js';
import { needsLogin, validate } from '#middlewares';
import {
  createNotificationSchema,
  getMyNotificationsQuerySchema,
  notificationIdParamSchema,
  readNotificationSchema,
} from './dto/notification.dto.js';

export class NotificationsController extends BaseController {
  #notificationsService;

  constructor({ notificationsService }) {
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

  async create(req, res) {
    const { userId, message, targetType, targetId, targetUrl } = req.body;
    const notification = await this.#notificationsService.createNotification({
      actorId: req.user.id,
      userId,
      message,
      targetType,
      targetId,
      targetUrl,
    });
    res.status(HTTP_STATUS.CREATED).json(notification);
  }

  async listMy(req, res) {
    const { page, limit, targetType } = req.query;
    const notifications = await this.#notificationsService.listMyNotifications({
      userId: req.user.id,
      page,
      limit,
      targetType,
    });
    res.status(HTTP_STATUS.OK).json(notifications);
  }

  async deleteMy(req, res) {
    const { id } = req.params;
    await this.#notificationsService.deleteMyNotification({
      userId: req.user.id,
      notificationId: id,
    });
    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }

  async markAsRead(req, res) {
    const { id } = req.params;
    const { isRead } = req.body;
    const updated = await this.#notificationsService.markAsRead({
      userId: req.user.id,
      notificationId: id,
      isRead,
    });
    res.status(HTTP_STATUS.OK).json(updated);
  }
}
