export interface In_APP_Logger {
  info(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
  flush?(): Promise<void>;
}

export interface In_APP_Error extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: any[];
}

