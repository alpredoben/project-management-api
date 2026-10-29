import { loadPaths } from './paths';
import { loadSchemas } from './schemas';
import { config } from '../config';

const baseUrl = `/${config.app.prefix}`;

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: config.pkg.swagger.title,
    version: config.pkg.swagger.version,
    description: config.pkg.swagger.description,
  },
  servers: [
    {
      url: baseUrl,
      description:
        config.app.env === 'production'
          ? 'Production Server'
          : 'Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Masukkan token JWT tanpa kata "Bearer "',
      },
    },
    schemas: loadSchemas(),
  },
  paths: loadPaths(),
};
