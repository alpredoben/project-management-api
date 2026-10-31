import { config } from "../../config";
import { devModeSlug } from "../utils/helper";

export const PAGINATION_PROPERTIES = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const FORCE_TIMEOUT_MS = 15000;

export const SKIPPED_PATHS: string[] = [
  "/favicon.ico",
  "/health",
  "/metrics",
] as const;

// HTTP Status
export const BASE_URL =
  config.app.url.replace(/\/+$/, "") + ":" + config.app.port;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const LIST_QUEUE = {
  UPLOAD_FILE: {
    CHANNEL: devModeSlug("upload-file-channel"),
    QUEUE: devModeSlug("queue_upload"),
    EXCHANGE: devModeSlug("exchange_upload"),
    ROUTING_KEY: devModeSlug("rk_upload"),
  },
  NOTIFICATION: {
    CHANNEL: devModeSlug("notificatin-channel"),
    QUEUE: devModeSlug("queue_notification"),
    EXCHANGE: "exchange_notification",
    ROUTING_KEY: "rk_notification",
  },
  ACTIVITY_LOG: {
    CHANNEL: devModeSlug("activity-log-channel"),
    QUEUE: devModeSlug("queue_activity_log"),
    EXCHANGE: devModeSlug("exchange_activity_log"),
    ROUTING_KEY: devModeSlug("rk_activity_log"),
  },
} as const;

export const ACTIVITY_EVENT_TYPES = {
  AUTH: "AUTH",
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  EXPORT: "EXPORT",
  SYSTEM: "SYSTEM",
} as const;

export const ACTOR_TYPES = {
  USER: "user",
  SYSTEM: "system",
  ADMIN: "admin",
  API_CLIENT: "api_client",
  CRON_JOB: "cron_job",
} as const;

export const STORAGE_VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
} as const;

export const ACTIVITY_ACTIONS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  EXPORT: "EXPORT",
  IMPORT: "IMPORT",
  UPLOAD: "UPLOAD",
  DOWNLOAD: "DOWNLOAD",
  SYSTEM: "SYSTEM",
  ASSIGN: "ASSIGN",
  UNASSIGN: "UNASSIGN",
} as const;

export const ENTITY_TYPES = {
  USER: "user",
  PROJECT: "project",
  TASK: "task",
  TEAMS: "teams",
  MEMBERS: "members",
} as const;

export const NOTIFICATION_STATUS = {
  READ: "READ",
  UNREAD: "UNREAD",
  ARCHIVED: "ARCHIVED",
} as const;

export const NOTIFICATION_CHANNEL = {
  SOCKET: "SOCKET",
  PUSH: "PUSH",
  BOTH: "BOTH",
} as const;

export const NOTIFICATION_PRIORITY = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT",
};

export const NOTIFICATION_EVENT_TYPE = {
  ASSIGNED_MEMBER: "ASSIGNED_MEMBER",
  PROGRESS_DONE: "PROGRESS_DONE",
  PROGRESS_REJECTED: "PROGRESS_REJECTED",
  PROGRESS_APPROVED: "PROGRESS_APPROVED",
  TASK_CREATED: "TASK_CREATED",
  TASK_UPDATED: "TASK_UPDATED",
  TASK_DELETED: "TASK_DELETED",
  PROJECT_CREATED: "PROJECT_CREATED",
  PROJECT_UPDATED: "PROJECT_UPDATED",
  PROJECT_DELETED: "PROJECT_DELETED",
  DEBUG_TEST: "DEBUG_TEST",
};

export const NOTIFICATION_EVENT_NAMES = {
  NEW: "notification:new",
  MARK_READ: "notification:mark_read",
};
