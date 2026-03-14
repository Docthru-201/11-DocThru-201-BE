import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler, cors } from '#middlewares';
// import { registerSwagger } from '#docs/swagger.js';

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const swaggerDocument = YAML.load(
  new URL('../swagger.yaml', import.meta.url).pathname,
);

export class App {
  constructor(controller, authMiddleware) {
    this.app = express();
    this.middleware(authMiddleware);
    this.routes(controller);
    this.errorHandling();
  }

  middleware(authMiddleware) {
    this.app.use(express.static('public'));
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(cors);
    this.app.use((req, res, next) =>
      authMiddleware.authenticate(req, res, next),
    );
  }

  // routes(controller) {
  //   registerSwagger(this.app);
  //   this.app.use('/api', controller.routes());
  // }

  // 임시 swagger
  routes() {
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument),
    );
  }

  errorHandling() {
    this.app.use(errorHandler);
  }

  listen(port) {
    return this.app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
      console.log('API Swagger: http://localhost:5001/api-docs');
    });
  }
}
