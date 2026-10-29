import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from '../docs/swagger-doc';
import logger from '../shared/utils/logger.util';

export const setupSwagger = (app: Application): void => {
  const options = {
    customCss: '.swagger-ui .topbar { background-color: #000080; }', // Tema biru tua (Navy) di topbar
    customSiteTitle: 'Warehouse API Docs',
  };

  app.use('/docs', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store'); 
    next();
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
  logger.info('[Swagger] Documentation ready at /docs');
};
