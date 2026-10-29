import express, { Application, Request, Response } from 'express';
import { config } from './config';
import { setupSecurityMiddlewares } from './middleware/security.middleware';
import { setupSwagger } from './pkg/swagger';
import { i18nMiddleware } from './lang/translation';
import routes from './routes';
import logger from './shared/utils/logger.util';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import path from 'path';
import { errorMiddleware } from './middleware/error.middleware';
import { HTTP_STATUS } from './shared/constants';

class App {
  public expressApp: Application;

  constructor() {
    this.expressApp = express();
    this.expressApp.set('trust proxy', true);

    // Initialize all configurations
    this.initializeStaticView();
    this.initializeSecurityMiddlewares();
    this.initializeStandardMiddlewares();
    this.initializeRateLimiter();
    this.initializeSwaggerDocs();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeStaticView(): void {
    this.expressApp.set('view engine', 'ejs');
    this.expressApp.set('views', path.join(__dirname, '../views'));
    this.expressApp.use(express.static(path.join(__dirname, '../public')));
  }

  private initializeRateLimiter(): void {
    const globalLimiter = rateLimitMiddleware(
      15 * 60 * 1000,
      100,
      'Terlalu banyak permintaan. Harap tunggu sebentar.'
    );

    const apiPrefix = `/${(config.app.prefix || 'api/v1').replace(/^\/+/, '')}`;
    this.expressApp.use(apiPrefix, globalLimiter);
  }

  // Initialize Security
  private initializeSecurityMiddlewares(): void {
    setupSecurityMiddlewares(this.expressApp);
  }

  // Initialize Standard Middleware
  private initializeStandardMiddlewares(): void {
    this.expressApp.use(loggerMiddleware);
    this.expressApp.use(i18nMiddleware);
  }

  // Initialize Doc Swagger
  private initializeSwaggerDocs(): void {
    if (config.app.env !== 'production') {
      setupSwagger(this.expressApp);
    }
  }

  // Register Routes
  private initializeRoutes(): void {
    this.expressApp.get('/', (req: Request, res: Response) => {
      if (config.app.env?.toLowerCase() != 'production') {
        res.render('index', {
          currentYear: new Date().getFullYear(),
          ip: req?.ip,
        });
      } else {
        res.render('landing_page', {
          currentYear: new Date().getFullYear(),
          ip: req?.ip,
        });
      }
    });

    // Endpoint ringan untuk healthcheck container & uji logging.
    this.expressApp.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({ success: true, status: 'ok' });
    });

    this.expressApp.get(
      '/realtime-notification',
      (req: Request, res: Response) => {
        res.render('notification', {
          currentYear: new Date().getFullYear(),
          ip: req?.ip,
          socketUrl: config.app.socketUrl,
        });
      }
    );

    const apiPrefix = (config.app.prefix || 'api/v1').replace(/^\/+/, '');
    this.expressApp.use(`/${apiPrefix}`, routes);
  }

  // Initialize All Error
  private initializeErrorHandling(): void {
    this.expressApp.use((req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: req.t
          ? req.t('error.default.not_found')
          : 'Endpoint atau sumber daya tidak ditemukan.',
      });
    });

    this.expressApp.use(errorMiddleware);

    this.expressApp.use((err: any, req: Request, res: Response) => {
      const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const message =
        err.message ||
        (req.t
          ? req.t('error.default.internal_server')
          : 'Terjadi kesalahan internal pada server.');

      logger.error(`[Error Middleware] ${statusCode} - ${message}`, {
        path: req.path,
        method: req.method,
        stack: err.stack,
      });

      if (res.headersSent) {
        return;
      }

      res.status(statusCode).json({
        success: false,
        message,
        ...(err.errors && { errors: err.errors }),
      });
    });
  }
}

export default new App().expressApp;
