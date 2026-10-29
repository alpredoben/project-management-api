import { Server } from 'http';
import logger from './shared/utils/logger.util';
import { closeDatabases } from './database/data-source';
import { QueueListenerManager } from './events/queue-listener.manager';
import { closeSocketServer } from './pkg/websocket';
import { redisService } from './pkg/redis';
import { FORCE_TIMEOUT_MS } from './shared/constants';

export class GracefulShutdown {
  private static isShuttingDown = false;

  public static handle(server: Server): void {
    const exitWithFlush = async (code: number) => {
      await logger.flush?.();
      process.exit(code);
    };

    const shutdown = async (signal: string) => {
      if (GracefulShutdown.isShuttingDown) return;
      GracefulShutdown.isShuttingDown = true;

      logger.info(
        `[Shutdown] Menerima sinyal ${signal}. Memulai graceful shutdown...`,
        { signal }
      );

      const forceTimer = setTimeout(() => {
        logger.error(
          `[Shutdown] Force shutdown karena melebihi batas waktu (${FORCE_TIMEOUT_MS / 1000}s).`
        );
        void exitWithFlush(1);
      }, FORCE_TIMEOUT_MS);
      forceTimer.unref();

      try {
        await closeSocketServer();
        logger.info(
          '[Shutdown] Socket.IO server dan adapter Redis berhasil ditutup.'
        );
      } catch (wsError: any) {
        logger.error(
          `[Shutdown] Error saat menutup Socket.IO: ${wsError.message}`
        );
      }

      server.close(async (err) => {
        if (err) {
          logger.error(
            `[Shutdown] Error saat menutup server HTTP: ${err.message}`
          );
          clearTimeout(forceTimer);
          await exitWithFlush(1);
          return;
        }
        logger.info('[Shutdown] Server HTTP berhasil ditutup.');

        try {
          await QueueListenerManager.stopAll();
          logger.info(
            '[Shutdown] Semua queue listener (RabbitMQ) berhasil ditutup.'
          );

          await closeDatabases();
          logger.info('[Shutdown] Semua koneksi database berhasil ditutup.');

          await redisService.disconnect();
          logger.info('[Shutdown] Koneksi Redis berhasil ditutup.');

          logger.info(
            '[Shutdown] Graceful shutdown selesai. Proses dihentikan.'
          );
          clearTimeout(forceTimer);
          await exitWithFlush(0);
        } catch (dbError: any) {
          logger.error(
            `[Shutdown] Error saat menutup koneksi data/antrian: ${dbError.message}`
          );
          clearTimeout(forceTimer);
          await exitWithFlush(1);
        }
      });
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));

    // Catch and write log that was not caught
    process.on('uncaughtException', async (err) => {
      logger.error(`[Fatal] Uncaught exception: ${err.message}`, {
        stack: err.stack,
      });
      await exitWithFlush(1);
    });

    process.on('unhandledRejection', (reason: any) => {
      logger.error(
        `[Fatal] Unhandled rejection: ${reason?.message ?? String(reason)}`,
        { stack: reason?.stack }
      );
    });
  }
}
