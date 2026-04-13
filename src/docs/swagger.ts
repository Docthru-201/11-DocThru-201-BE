import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from '#docs/openapi.js';

const swaggerHandler = swaggerUi.setup(openApiDocument, {
  explorer: true,
});

export const registerSwagger = (app) => {
  app.get('/api/openapi.json', (_req, res) => {
    res.status(200).json(openApiDocument);
  });

  app.use('/api/docs', swaggerUi.serve);
  app.get('/api/docs', swaggerHandler);
};
