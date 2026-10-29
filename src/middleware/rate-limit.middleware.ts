import { Request, Response, NextFunction } from 'express';
import { redisService } from '../pkg/redis'; // Menggunakan instance Redis terpusat yang sudah ada
import { AppError } from '../shared/utils/error.util';
import logger from '../shared/utils/logger.util';

/**
 * Factory function untuk membuat middleware rate limiter berbasis Redis.
 * @param windowMs Waktu jendela dalam milidetik (contoh: 15 menit = 15 * 60 * 1000)
 * @param max Maksimal jumlah request yang diizinkan dalam rentang waktu tersebut
 * @param message Pesan kustom ketika batas terlampaui
 */
export const rateLimitMiddleware = (
  windowMs: number = 15 * 60 * 1000,
  max: number = 100,
  message: string = 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Ambil klien Redis yang terpusat
      const redisClient = redisService.getClient();

      // Identifikasi klien berdasarkan IP (mendukung reverse proxy)
      const clientIp = (req.ip || req.headers['x-forwarded-for'] || 'unknown-ip') as string;
      const key = `ratelimit:${clientIp}:${req.baseUrl}${req.path}`;
      const windowSeconds = Math.ceil(windowMs / 1000);

      // Gunakan transaksi Redis (multi/exec) agar operasi increment dan ttl berjalan secara atomic
      const multi = redisClient.multi();
      multi.incr(key);
      multi.ttl(key);

      const results = await multi.exec();

      if (!results) {
        return next(); // Jika terjadi kendala pada Redis, lewati (fail-open) demi ketersediaan layanan
      }

      // Hasil dari multi.exec() berbentuk array [err, result]
      const incrResult = results[0];
      const ttlResult = results[1];

      if (incrResult[0] || ttlResult[0]) {
        logger.error(`[RateLimit] Redis transaction error: ${incrResult[0] || ttlResult[0]}`);
        return next();
      }

      const currentRequests = incrResult[1] as number;
      let ttl = ttlResult[1] as number;

      // Jika key baru dibuat (ttl === -1), atur masa kedaluwarsa (expire)
      if (ttl === -1) {
        await redisClient.expire(key, windowSeconds);
        ttl = windowSeconds;
      }

      // Set header informasi rate limit standar industri
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - currentRequests));
      res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + ttl);

      // Jika jumlah request melewati batas maksimum
      if (currentRequests > max) {
        logger.warn(`[RateLimit] Batas terlampaui untuk IP: ${clientIp} pada rute: ${req.originalUrl}`);

        // Terjemahkan pesan menggunakan i18n jika tersedia di request, jika tidak gunakan default
        const localizedMessage = req.t ? req.t('error.rate_limit', { defaultValue: message }) : message;

        throw new AppError(localizedMessage, 429); // 429 Too Many Requests
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Contoh Rate Limiter khusus untuk rute Auth yang lebih ketat
 * (Misalnya: Maksimal 5 kali percobaan dalam rentang 15 menit)
 */
export const authRateLimiter = rateLimitMiddleware(
  15 * 60 * 1000,
  5,
  'Terlalu banyak percobaan login gagal. Silakan coba lagi setelah 15 menit.'
);
