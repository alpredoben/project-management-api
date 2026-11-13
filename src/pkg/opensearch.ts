import winston from 'winston';
import TransportStream from 'winston-transport';
import { Client } from '@opensearch-project/opensearch';
import { config } from '../config';

// Interface OpenSearch Transport
interface OpenSearchTransportOptions extends TransportStream.TransportStreamOptions {
  node: string;
  auth?: {
    username: string;
    password: string;
  };
  indexPrefix?: string;
  rejectUnauthorized?: boolean;
}

// Custom Winston Transport for OpenSearch
class OpenSearchTransport extends TransportStream {
  private client: Client;
  private indexPrefix: string;

  constructor(opts: OpenSearchTransportOptions) {
    super(opts);
    this.indexPrefix = opts.indexPrefix || 'pm-api-logs';

    this.client = new Client({
      node: opts.node,
      auth: opts.auth,
      ssl: {
        rejectUnauthorized: opts.rejectUnauthorized ?? false,
      },
    });
  }

  public override async log(info: winston.Logform.TransformableInfo, next: () => void): Promise<void> {
    setImmediate(() => {
      this.emit('logged', info);
    });

    try {
      const { level, message, timestamp, ...meta } = info;

      // Membuat indeks harian otomatis, contoh: pm-api-logs-2026.11.13
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
      const indexName = `${this.indexPrefix}-${dateStr}`;

      const logDocument = {
        '@timestamp': timestamp || new Date().toISOString(),
        level,
        message,
        meta: Object.keys(meta).length > 0 ? meta : undefined,
        environment:config.app.env || 'development',
        service: config.app.name || 'pm-api',
      };

      await this.client.index({
        index: indexName,
        body: logDocument,
      });
    } catch (error) {
      console.error('Failed to send log to OpenSearch:', error);
    }

    next();
  }
}

// Environment of config
const opensearchNode = config.pkg.opensearch.host;
const opensearchUsername = config.pkg.opensearch.username
const opensearchPassword = config.pkg.opensearch.password;

// Format Console for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` | meta: ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}]: ${message}${metaString}`;
  })
);

// Inisialisasi Winston Logger
export const openSourceLogger = winston.createLogger({
  level: config.app.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: config.app.name },
  transports: [
    // Output ke Console / Terminal
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // Output ke OpenSearch Index
    new OpenSearchTransport({
      node: opensearchNode,
      auth: {
        username: opensearchUsername,
        password: opensearchPassword,
      },
      indexPrefix: config.pkg.opensearch.prefix,
      rejectUnauthorized: false,
    }),
  ],
});
