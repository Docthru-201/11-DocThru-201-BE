import { BaseController } from '#controllers/base.controller.js';

export class NotificationsController extends BaseController {
  #notificationsService;

  constructor({ notificationsService }) {
    super();
    this.#notificationsService = notificationsService;
  }

  routes() {
    return this.router;
  }

  async create(req, res) {}

  async listMy(req, res) {}

  async deleteMy(req, res) {}

  async markAsRead(req, res) {}
}
