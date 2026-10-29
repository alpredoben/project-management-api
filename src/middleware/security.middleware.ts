import { Application, json, urlencoded } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { config } from '../config';

export const setupSecurityMiddlewares = (app: Application): void => {
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src': [
            "'self'",
            'https://cdn.socket.io',
            "'unsafe-inline'",
            'https://cdn.socket.io',
            'https://cdn.tailwindcss.com',
          ],
          'style-src': ["'self'", "'unsafe-inline'"],
          // Izinkan koneksi websocket ke server yang sama
          'connect-src': [
            "'self'",
            'ws://127.0.0.1:*',
            'wss://127.0.0.1:*',
            'https://cdn.socket.io',
          ],
        },
      },
    })
  );

  // Cors
  app.use(
    cors({
      origin: config.middleware.cors.origins || '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
      credentials: true,
    })
  );

  // Compression
  app.use(compression());

  // Body Parser
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Basic XSS Protection Header
  app.use((_req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
};
