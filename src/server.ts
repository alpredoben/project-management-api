import app from './app';
import { config } from './config';
import { initializeDatabases } from './database/data-source';
import { QueueListenerManager } from './events/queue-listener.manager';
import { GracefulShutdown } from './graceful-shutdown';
import { initSapSessionCron } from './jobs/sap-session.job';
import { redisService } from './pkg/redis';
import { initSocketServer } from './pkg/websocket';
import { BASE_URL } from './shared/constants';
import logger from './shared/utils/logger.util';

const startServer = async () => {
  logger.info('[Server] Running Rest API Warehouse Server', {
    env: config.app.env,
    port: config.app.port,
  });

  try {
    await initializeDatabases();
    logger.info('[Server] Semua koneksi database berhasil diinisialisasi.');

    redisService.connect();
    logger.info('[Server] Koneksi Redis berhasil diinisialisasi.');

    if (config.app.env?.toLowerCase() !== 'production') {
      initSapSessionCron();
      logger.info('[Server] Cronjob SAP Session Checking berjalan.');
    }

    await QueueListenerManager.startAll();
    logger.info('[Server] Queue listener berhasil dijalankan.');

    const port = config.app.port || 3000;
    const server = app.listen(port, '0.0.0.0', () => {
      logger.info(
        `[Server] Aplikasi berjalan di lingkungan: ${config.app.env || 'development'}`
      );
      logger.info(`[Server] Mendengarkan koneksi pada port: ${port}`);
      logger.info(`[Server] Dokumentasi Swagger UI aktif di: ${BASE_URL}/docs`);
    });

    await initSocketServer(server);
    logger.info('[Server] Socket.IO server berhasil diinisialisasi.');

    GracefulShutdown.handle(server);
  } catch (error: any) {
    logger.error(
      `[Server] Gagal menjalankan aplikasi secara utuh: ${error.message}`,
      { stack: error.stack }
    );
    await logger.flush?.();
    process.exit(1);
  }
};

void startServer();
