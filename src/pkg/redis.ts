import Redis from 'ioredis';
import { config } from '../config';

export class RedisService {
  private client: Redis | null = null;

  public connect(): Redis {
    if (!this.client) {
      this.client = new Redis({
        host: config.pkg.redis.host,
        port: config.pkg.redis.port,
        password: config.pkg.redis.password || undefined,
        retryStrategy: (times) => {
          const delay = Math.min(times * 100, 3000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.client.on('connect', () => {
        console.log('[Redis] Connected successfully');
      });

      this.client.on('error', (err) => {
        console.error('[Redis] Connection error:', err.message);
      });
    }

    return this.client;
  }

  public getClient(): Redis {
    if (!this.client) {
      return this.connect();
    }
    return this.client;
  }

  public async set(
    key: string,
    value: string,
    ttlSeconds?: number
  ): Promise<void> {
    const client = this.getClient();
    if (ttlSeconds) {
      await client.set(key, value, 'EX', ttlSeconds);
    } else {
      await client.set(key, value);
    }
  }

  public async get(key: string): Promise<string | null> {
    return await this.getClient().get(key);
  }

  public async del(key: string): Promise<number> {
    return await this.getClient().del(key);
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      console.log('[Redis] Disconnected successfully');
    }
  }
}

export const redisService = new RedisService();
