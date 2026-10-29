import winston from 'winston';
import LokiTransport from 'winston-loki';
import os from 'os';
import { config, lokiBaseUrl } from '../config';
import { In_APP_Logger } from '../interfaces/app.interface';

export class LokiLogger implements In_APP_Logger {
  private logger: winston.Logger;
  private lokiTransport?: LokiTransport;
  public readonly lokiUrl: string;
  public readonly labels: Record<string, string>;

  constructor() {
    this.lokiUrl = lokiBaseUrl();
    this.labels = {
      app: config.pkg.loki.logName,
      job: config.pkg.loki.logName,
      environment: config.app.env || 'development',
      source: 'winston',
      host: os.hostname(),
    };

    const consoleTransport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaString = Object.keys(meta).length
            ? JSON.stringify(meta)
            : '';
          return `[${timestamp}] [${level}]: ${message} ${metaString}`;
        })
      ),
    });

    const transports: winston.transport[] = [consoleTransport];

    if (config.pkg.loki.enabled) {
      const basicAuth =
        config.pkg.loki.username && config.pkg.loki.password
          ? `${config.pkg.loki.username}:${config.pkg.loki.password}`
          : undefined;

      // Header tenant HANYA saat Loki memang auth_enabled: true.
      const headers =
        config.pkg.loki.multiTenancy && config.pkg.loki.tenantId
          ? { 'X-Scope-OrgID': config.pkg.loki.tenantId }
          : undefined;

      try {
        this.lokiTransport = new LokiTransport({
          host: this.lokiUrl,
          basicAuth,
          headers,
          labels: this.labels,
          json: true,
          format: winston.format.json(),
          replaceTimestamp: true,
          batching: true,
          interval: config.pkg.loki.batchInterval, // flush tiap N detik
          timeout: config.pkg.loki.timeout,
          clearOnError: true,
          gracefulShutdown: true,
          onConnectionError: (err: unknown) => {
            console.error(
              `[LokiLogger] Gagal push ke ${this.lokiUrl}:`,
              err instanceof Error ? err.message : err
            );
          },
        });

        transports.push(this.lokiTransport);
        console.log(
          `[LokiLogger] Transport aktif -> ${this.lokiUrl} | labels=${JSON.stringify(
            this.labels
          )}`
        );
      } catch (err) {
        console.error('[LokiLogger] Failed to initialize Loki transport:', err);
      }
    } else {
      console.warn('[LokiLogger] LOKI_ENABLED=false, push langsung dimatikan.');
    }

    this.logger = winston.createLogger({
      level: config.app.logLevel || 'info',
      // exitOnError:false supaya error transport tidak mematikan proses
      exitOnError: false,
      defaultMeta: { service: config.pkg.loki.logName },
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports,
    });

    // Tangkap error internal winston (mis. Loki unreachable) tanpa crash.
    this.logger.on('error', (err) =>
      console.error('[LokiLogger] winston error:', err?.message ?? err)
    );
  }

  public info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, meta);
  }

  public error(message: string, meta?: Record<string, any>): void {
    this.logger.error(message, meta);
  }

  public warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, meta);
  }

  public debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, meta);
  }

  /** Force the transmission of batches still held in memory */
  public async flush(): Promise<void> {
    if (!this.lokiTransport) return;

    try {
      const maybeFlush = (this.lokiTransport as any).flush;
      if (typeof maybeFlush === 'function') {
        await maybeFlush.call(this.lokiTransport);
      }
    } catch (err) {
      console.error('[LokiLogger] flush error:', err);
    }

    await new Promise((resolve) =>
      setTimeout(resolve, Math.max(config.pkg.loki.batchInterval * 1000, 1000))
    );
  }
}

export const logger = new LokiLogger();
