import {openSourceLogger} from '../../pkg/opensearch'
import { In_APP_Logger } from '../../interfaces/app.interface';

class AppLogger implements In_APP_Logger {
  public info(message: string, meta?: Record<string, any>): void {
    openSourceLogger.info(message, meta);
  }

  public error(message: string, meta?: Record<string, any>): void {
    openSourceLogger.error(message, meta);
  }

  public warn(message: string, meta?: Record<string, any>): void {
    openSourceLogger.warn(message, meta)
  }

  public debug(message: string, meta?: Record<string, any>): void {
    openSourceLogger.debug(message, meta);
  }

}

const logger = new AppLogger();
export default logger;
