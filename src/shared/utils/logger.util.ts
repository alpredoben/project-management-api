import { logger as lokiLogger } from '../../pkg/loki';
import { In_APP_Logger } from '../../interfaces/app.interface';

class AppLogger implements In_APP_Logger {
  public info(message: string, meta?: Record<string, any>): void {
    lokiLogger.info(message, meta);
  }

  public error(message: string, meta?: Record<string, any>): void {
    lokiLogger.error(message, meta);
  }

  public warn(message: string, meta?: Record<string, any>): void {
    lokiLogger.warn(message, meta);
  }

  public debug(message: string, meta?: Record<string, any>): void {
    lokiLogger.debug(message, meta);
  }

  public async flush(): Promise<void> {
    await lokiLogger.flush();
  }
}

const logger = new AppLogger();
export default logger;
