import { BaseController } from '#controllers/base.controller.js';

export class UsersController extends BaseController {
  #usersService;

  constructor({ usersService }) {
    super();
    this.#usersService = usersService;
  }

  routes() {
    return this.router;
  }

  async findAll(req, res) {}

  async findById(req, res) {}

  async create(req, res) {}

  async update(req, res) {}

  async delete(req, res) {}
}

