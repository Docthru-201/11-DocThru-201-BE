import { BaseController } from '#controllers/base.controller.js';

export class CommentsController extends BaseController {
  #commentsService;

  constructor({ commentsService }) {
    super();
    this.#commentsService = commentsService;
  }

  routes() {
    return this.router;
  }

  async create(req, res) {}

  async list(req, res) {}

  async update(req, res) {}

  async delete(req, res) {}
}
