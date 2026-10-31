import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import logger from "../shared/utils/logger.util";
import { HTTP_STATUS, SKIPPED_PATHS } from "../shared/constants";

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (SKIPPED_PATHS.includes(req.path)) {
    next();
    return;
  }

  const start = Date.now();

  const requestId = (req.headers["x-request-id"] as string) || randomUUID();
  (req as any).id = requestId;
  res.setHeader("X-Request-Id", requestId);

  let logged = false;

  const writeLog = () => {
    if (logged) return;

    logged = true;
    const duration = Date.now() - start;
    const forwarded = req.headers["x-forwarded-for"];
    const ip =
      req.ip ||
      (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0]) ||
      req.socket.remoteAddress ||
      "unknown";

    const logMetadata = {
      request_id: requestId,
      method: req.method,
      url: req.originalUrl,
      route: req.route?.path ?? req.baseUrl ?? req.path,
      status: res.statusCode,
      execution_time_ms: duration,
      ip,
      userAgent: req.get("user-agent") || "unknown",
      userId: req.user?.id ?? "unauthenticated",
      userName: req.user?.name ?? "No name",
      aborted: !res.writableEnded,
    };

    const message = `${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`;

    if (res.statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
      logger.error(message, logMetadata);
    } else if (res.statusCode >= HTTP_STATUS.BAD_REQUEST) {
      logger.warn(message, logMetadata);
    } else {
      logger.info(message, logMetadata);
    }
  };

  res.on("finish", writeLog);
  res.on("close", writeLog);
  next();
};
