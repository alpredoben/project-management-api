import logger from "../shared/utils/logger.util";
import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { config } from "../config";
import { redisService } from "./redis";
import {
  In_AuthenticatedSocket,
  socketAuthMiddleware,
} from "../middleware/socketAuthMiddleware";
import { NOTIFICATION_EVENT_NAMES } from "../shared/constants";

let IO: SocketIOServer | null = null;
let adapterPubClient: ReturnType<
  ReturnType<typeof redisService.getClient>["duplicate"]
> | null = null;
let adapterSubClient: ReturnType<
  ReturnType<typeof redisService.getClient>["duplicate"]
> | null = null;

const ALLOWED_ORIGINS = (config.app.socketOrigin || "")
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);

export const initSocketServer = async (
  httpServer: HttpServer,
): Promise<SocketIOServer> => {
  IO = new SocketIOServer(httpServer, {
    cors: {
      origin: ALLOWED_ORIGINS,
      credentials: true,
    },
    maxHttpBufferSize: 1e6, // 1MB, cegah payload besar/abuse
    transports: ["websocket"],
  });

  const baseClient = redisService.getClient();
  const pubClient = baseClient.duplicate();
  const subClient = baseClient.duplicate();
  adapterPubClient = pubClient;
  adapterSubClient = subClient;

  pubClient.on("error", (err) => {
    logger.error("Redis pub client error (socket adapter)", {
      error: err.message,
    });
  });
  subClient.on("error", (err) => {
    logger.error("Redis sub client error (socket adapter)", {
      error: err.message,
    });
  });

  IO.adapter(createAdapter(pubClient, subClient));

  IO.use(socketAuthMiddleware);

  // Rate limit
  const eventCounters = new Map<string, { count: number; resetAt: number }>();
  const isRateLimited = (socketId: string, limit = 30, windowMs = 10_000) => {
    const now = Date.now();
    const entry = eventCounters.get(socketId);
    if (!entry || now > entry.resetAt) {
      eventCounters.set(socketId, { count: 1, resetAt: now + windowMs });
      return false;
    }
    entry.count += 1;
    return entry.count > limit;
  };

  IO.on("connection", (socket: In_AuthenticatedSocket) => {
    const { id } = socket.user!;

    socket.join(`user:${id}`);

    console.log("[Socket IO] Socket connected", {
      socketId: socket.id,
      id,
    });

    logger.info("Socket connected", {
      socketId: socket.id,
      id,
    });

    socket.on(NOTIFICATION_EVENT_NAMES.MARK_READ, async (payload, ack) => {
      if (isRateLimited(socket.id)) {
        logger.warn("Socket rate limit exceeded", {
          socketId: socket.id,
          id,
        });
        return ack?.({ ok: false, error: "RATE_LIMITED" });
      }
      if (!payload?.notificationId) {
        return ack?.({ ok: false, error: "INVALID_PAYLOAD" });
      }

      try {
        // const { notificationService } =
        //   require("../modules/notifications/notification.service") as typeof import("../modules/notifications/notification.service");

        // await notificationService.markAsRead(id, payload.notificationId);

        ack?.({ ok: true });
      } catch (err) {
        logger.error("Failed to mark notification as read via socket", {
          socketId: socket.id,
          id,
          notificationId: payload.notificationId,
          error: (err as Error).message,
        });
        ack?.({ ok: false, error: "MARK_AS_READ_FAILED" });
      }
    });

    socket.on("disconnect", (reason) => {
      eventCounters.delete(socket.id);
      logger.info("Socket disconnected", {
        socketId: socket.id,
        id,
        reason,
      });
    });

    socket.on("error", (err) => {
      logger.error("Socket error", {
        socketId: socket.id,
        id,
        error: err.message,
      });
    });
  });

  logger.info("Socket.IO server initialized");
  return IO;
};

export const getSocketServer = (): SocketIOServer => {
  if (!IO) {
    throw new Error("Socket.IO server has not been initialized yet.");
  }
  return IO;
};

export const closeSocketServer = async (): Promise<void> => {
  if (IO) {
    await new Promise<void>((resolve) => IO!.close(() => resolve()));
    IO = null;
  }
  if (adapterPubClient) {
    await adapterPubClient.quit().catch(() => undefined);
    adapterPubClient = null;
  }
  if (adapterSubClient) {
    await adapterSubClient.quit().catch(() => undefined);
    adapterSubClient = null;
  }
};

/** Emit notifikasi realtime ke SATU user tertentu. */
export const emitNotificationToUser = (
  id: string,
  event: string,
  payload: unknown,
): void => {
  getSocketServer().to(`user:${id}`).emit(event, payload);
};

/** Broadcast ke seluruh user dalam 1 region (kd_region) */
export const emitNotificationToRegion = (
  kdRegion: string,
  event: string,
  payload: unknown,
): void => {
  getSocketServer().to(`region:${kdRegion}`).emit(event, payload);
};

/** Broadcast ke seluruh user dalam 1 area/wilayah kerja (kd_area) */
export const emitNotificationToArea = (
  kdArea: string,
  event: string,
  payload: unknown,
): void => {
  getSocketServer().to(`area:${kdArea}`).emit(event, payload);
};
