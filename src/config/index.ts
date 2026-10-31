import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getEnvBool = (key: string, fallback: string = "false"): boolean => {
  const value = getEnv(key, fallback).trim().toLowerCase();
  return value === "true" || value === "1";
};

const getEnvOptional = (key: string, fallback: string = ""): string =>
  (process.env[key] ?? fallback).trim();

export const config = {
  app: {
    name: getEnv("APP_NAME", "Boilerplate Rest API"),
    prefix: getEnv("API_PREFIX", "api/v1"),
    lang: getEnv("APP_LANG", "id"),
    timezone: getEnv("APP_TIMEZONE", "Asia/Jakarta"),
    appKey: getEnv("APP_KEY", "fdf7298a142185f55a7c9b6987"),
    logLevel: getEnv("LOG_LEVEL", "info"),
    env: getEnv("NODE_ENV", "development"),
    port: Number(getEnv("PORT", "8091")),
    url: getEnv("APP_URL", "http://0.0.0.0"),
    useDomainSwagger: getEnvBool("USE_DOMAIN_ON_SWAGGER", "false"),
    socketOrigin: getEnv("SOCKET_CORS_ORIGINS", "*"),
    socketUrl: getEnv("SOCKET_URL", "https://devwarehouse.nusadaya.net"),
  },
  pkg: {
    swagger: {
      title: getEnv("SWAGGER_TITLE", "REST API Index (PT. PLN Nusa Daya)"),
      version: getEnv("SWAGGER_VERSION", "1.0.0"),
      description: getEnv(
        "SWAGGER_DESCRIPTION",
        "Dokumentasi REST API Aplikasi Inventory Nusadaya Excellence",
      ),
    },
    db: {
      driver: getEnv("DB_DRIVER", "postgres"),
      synchronize: getEnvBool("DB_SYNCHRONIZE", "false"),
      logging: getEnvBool("DB_LOGGING", "false"),
      ssl: getEnvBool("DB_SSL", "false"),
      connectTimeout: Number(getEnv("DB_CONNECT_TIMEOUT", "10000")),
      host: getEnv("DB_HOST"),
      port: Number(getEnv("DB_PORT", "3307")),
      user: getEnv("DB_USER"),
      pass: getEnv("DB_PASS"),
      name: getEnv("DB_NAME"),
    },
    jwt: {
      secret: getEnv("JWT_SECRET", "secret"),
      ttl: Number(getEnv("JWT_TTL", "60")),
      refreshTtl: Number(getEnv("JWT_REFRESH_TTL", "43200")),
    },
    redis: {
      host: getEnv("REDIS_HOST", "localhost"),
      username: getEnv("REDIS_USER", "admin"),
      port: Number(getEnv("REDIS_PORT", "6379")),
      password: getEnv("REDIS_PASSWORD"),
    },
    rabbitmq: {
      host: getEnv("RABBITMQ_HOST", "localhost"),
      port: Number(getEnv("RABBITMQ_PORT", "5432")),
      username: getEnv("RABBITMQ_USERNAME", "guest"),
      password: getEnv("RABBITMQ_PASSWORD", "guest"),
    },
    minio: {
      endPoint: getEnv("MINIO_HOST", "localhost"),
      port: Number(getEnv("MINIO_PORT", "9000")),
      accessKey: getEnv("MINIO_ACCESS_KEY", "minioAccess"),
      secretKey: getEnv("MINIO_SECRET_KEY", "minioSecret"),
      bucket: getEnv("MINIO_BUCKET", "warehouse-bucket"),
    },
    loki: {
      enabled: getEnvBool("LOKI_ENABLED", "true"),
      host: getEnv("LOKI_HOST", "localhost"),
      port: Number(getEnv("LOKI_PORT", "3201")),
      username: getEnvOptional("LOKI_USERNAME"),
      password: getEnvOptional("LOKI_PASSWORD"),
      environment: getEnv("LOG_ENVIRONMENT", "development"),
      multiTenancy: getEnvBool("LOKI_MULTITENANCY", "false"),
      tenantId: getEnvOptional("LOKI_TENANT_ID", "warehouse-tenant-1"),
      logName: getEnv("LOG_APP_NAME", "warehouse-api"),
      batchInterval: Number(getEnv("LOKI_BATCH_INTERVAL", "2")), // detik
      timeout: Number(getEnv("LOKI_TIMEOUT_MS", "10000")),
    },
    grafana: {
      url: getEnv("GRAFANA_URL", "http://localhost:3001"),
      username: getEnv("GRAFANA_ADMIN_USER", "admin"),
      password: getEnv("GRAFANA_ADMIN_PASSWORD", "password123"),
    },
    captcha: {
      enabled: getEnvBool("RECAPTCHA_ENABLED", "true"),
    },
  },
  middleware: {
    rateLimit: {
      windowMS: Number(getEnv("RATE_LIMIT_WINDOW_MS", "60000")),
      max: Number(getEnv("RATE_LIMIT_MAX", "100")),
    },
    cors: {
      origins: getEnv("CORS_ALLOWED_ORIGINS", "*"),
      maxAge: Number(getEnv("CORS_MAX_AGE", "86400")),
    },
  },
  security: {
    password: {
      salt: Number(getEnv("BCRYPT_SALT_ROUNDS", "12")),
      pattern: getEnv(
        "BCRYPT_HASH_PATTERN",
        "/^\$2[aby]\$(\d{2})\$[./A-Za-z0-9]{53}$/",
      ),
    },
  },
};

export const lokiBaseUrl = (): string => {
  const host = config.pkg.loki.host.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(host)) {
    const withoutScheme = host.replace(/^https?:\/\//i, "");
    const hasPort = /:\d+$/.test(withoutScheme);
    return hasPort ? host : `${host}:${config.pkg.loki.port}`;
  }
  return `http://${host}:${config.pkg.loki.port}`;
};
