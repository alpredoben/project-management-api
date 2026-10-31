import { Socket } from "socket.io";
import { In_AUTH_JwtPayload } from "../interfaces/auth.interface";
import logger from "../shared/utils/logger.util";
import { JwtService } from "../pkg/jwt";

export interface In_AuthenticatedSocket extends Socket {
  user?: In_AUTH_JwtPayload;
}

export const socketAuthMiddleware = (
  socket: In_AuthenticatedSocket,
  next: (err?: Error) => void,
): void => {
  try {
    const token =
      socket.handshake.auth?.["token"] ||
      (socket.handshake.headers?.authorization || "").replace("Bearer ", "");

    if (!token) {
      logger.warn("Socket connection rejected: no token", {
        socketId: socket.id,
        ip: socket.handshake.address,
      });
      return next(new Error("UNAUTHORIZED"));
    }

    const payload = JwtService.verifyToken(token);

    if (!payload?.id) {
      logger.warn("Socket connection rejected: token payload missing userId", {
        socketId: socket.id,
        ip: socket.handshake.address,
      });
      return next(new Error("UNAUTHORIZED"));
    }

    socket.user = payload;
    next();
  } catch (error: any) {
    logger.warn("Socket connection rejected: invalid/expired token", {
      socketId: socket.id,
      ip: socket.handshake.address,
      error: error?.message,
    });
    next(new Error("UNAUTHORIZED"));
  }
};
