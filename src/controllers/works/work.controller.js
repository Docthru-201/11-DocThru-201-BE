import { BaseController } from '#controllers/base.controller.js';

export class WorksController extends BaseController {
  #worksService;

  constructor({ worksService }) {
    super();
    this.#worksService = worksService;
  }

  routes() {
    return this.router;
  }

  async create(req, res) {}

  async findById(req, res) {}

  async update(req, res) {}

  async delete(req, res) {}
}
