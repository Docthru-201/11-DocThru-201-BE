import { BaseController } from '#controllers/base.controller.js';
import { needsLogin, validate } from '#middlewares';
import {
  workIdParamSchema,
  createWorkSchema,
  updateWorkSchema,
} from './dto/works.dto.js';

export class WorksController extends BaseController {
  #worksService;

  constructor({ worksService }) {
    super();
    this.#worksService = worksService;
  }

  routes() {
    this.router.post(
      '/',
      needsLogin,
      validate('body', createWorkSchema),
      (req, res) => this.create(req, res),
    );
    this.router.get('/:id', validate('params', workIdParamSchema), (req, res) =>
      this.findById(req, res),
    );
    this.router.patch(
      '/:id',
      needsLogin,
      validate('params', workIdParamSchema),
      validate('body', updateWorkSchema),
      (req, res) => this.update(req, res),
    );
    this.router.delete(
      '/:id',
      needsLogin,
      validate('params', workIdParamSchema),
      (req, res) => this.delete(req, res),
    );
    return this.router;
  }

  async create(req, res) {}

  async findById(req, res) {}

  async update(req, res) {}

  async delete(req, res) {}
}

