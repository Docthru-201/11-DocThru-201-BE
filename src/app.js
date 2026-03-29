import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from '#config';
import {
  errorHandler,
  cors,
  helmetMiddleware,
  csrfOriginMiddleware,
  httpsRedirectMiddleware,
  authRateLimiter,
  apiRateLimiter,
} from '#middlewares';
// import { registerSwagger } from '#docs/swagger.js';

// 임시: 스웨거
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 임시: 윈도우 상에서의 경로문제 해결
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const swaggerPath = path.join(__dirname, '..', 'swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

export class App {
  #deadlineScheduler;
  constructor(controller, authMiddleware, deadlineScheduler) {
    this.app = express();
    this.#deadlineScheduler = deadlineScheduler;
    this.middleware(authMiddleware);
    this.routes(controller);
    this.errorHandling();
  }

  middleware(authMiddleware) {
    if (config.TRUST_PROXY > 0) {
      this.app.set('trust proxy', config.TRUST_PROXY);
    }

    this.app.use(httpsRedirectMiddleware);

    this.app.use(express.static('public'));
    this.app.use(helmetMiddleware);
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(csrfOriginMiddleware);
    this.app.use(cors);
    this.app.use((req, res, next) =>
      authMiddleware.authenticate(req, res, next),
    );
  }

  routes(controller) {
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument),
    );
    this.app.use('/api/auth', authRateLimiter);
    this.app.use('/api', apiRateLimiter);
    this.app.use('/api', controller.routes());
  }

  errorHandling() {
    this.app.use(errorHandler);
  }

  listen(port) {
    return this.app.listen(port, () => {
      if (this.#deadlineScheduler) {
        this.#deadlineScheduler.start();
      }
      console.log(`Server is running at http://localhost:${port}`);
      console.log('API Swagger: http://localhost:5001/api-docs');
    });
  }
}
