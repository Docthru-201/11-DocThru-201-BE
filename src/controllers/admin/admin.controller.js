import { BaseController } from '#controllers/base.controller.js';

export class AdminController extends BaseController {
  constructor() {
    super();
  }

  routes() {
    return this.router;
  }

  async getManagement(req, res) {}
}
