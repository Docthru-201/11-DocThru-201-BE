import express, { type Router } from 'express';

export class BaseController {
  protected router: Router;

  constructor() {
    this.router = express.Router();
  }

  routes(): Router {
    throw new Error('Method not implemented.');
  }
}
