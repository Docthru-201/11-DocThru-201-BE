import { BaseController } from '#controllers/base.controller.js';

export class AuthController extends BaseController {
  #authService;
  #cookieProvider;

  constructor({ authService, cookieProvider }) {
    super();
    this.#authService = authService;
    this.#cookieProvider = cookieProvider;
  }

  routes() {
    return this.router;
  }

  async signUp(req, res) {}

  async login(req, res) {}

  async logout(req, res) {}

  async me(req, res) {}
}
