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
      driver: getEnv("DATABASE_DRIVER", "postgres"),
      synchronize: getEnvBool("DATABASE_SYNCHRONIZE", "false"),
      logging: getEnvBool("DATABASE_LOGGING", "false"),
      ssl: getEnvBool("DATABASE_SSL", "false"),
      connectTimeout: Number(getEnv("DATABASE_CONNECT_TIMEOUT", "10000")),
      host: getEnv("DATABASE_HOST"),
      port: Number(getEnv("DB_PORT", "5432")),
      user: getEnv("DATABASE_USER"),
      pass: getEnv("DATABASE_PASS"),
      name: getEnv("DATABASE_NAME"),
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
    opensearch: {
      host: getEnv('OPENSEARCH_HOST', 'http://localhost:9200'),
      nodePassword: getEnv('OPENSEARCH_NODE_PASSWORD', 'nodePassword'),
      username: getEnv("OPENSEARCH_USERNAME", "admin"),
      password: getEnv("OPENSEARCH_PASSWORD", "password"),
      prefix: getEnv('OPENSEARCH_INDEX_PREFIX', 'pm-api-dev-logs'),
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


