import { createClient, RedisClientType } from 'redis';

import { ICacheService } from '@/application/ports/ICacheService';
import { ILogger } from '@/application/ports/ILogger';

interface IMemoryEntry {
  value: string;
  timeExpire: number;
}

/**
 * Cache implementation with graceful degradation: uses Redis when available and
 * falls back to an in-memory store otherwise, so the app never crashes if Redis
 * is down.
 */
export class RedisCacheService implements ICacheService {
  private _client: RedisClientType;
  private _up = false;
  private readonly _memory = new Map<string, IMemoryEntry>();

  constructor(private readonly _logger: ILogger) {
    this._client = createClient({
      // Fail fast instead of retrying forever (important for tests / no Redis).
      socket: { reconnectStrategy: () => false },
    }) as RedisClientType;

    this._client.connect().then(
      () => {
        this._up = true;
      },
      () => {
        this._up = false;
      }
    );

    this._client.on('error', (err) => {
      this._logger.error({ error: err, method: 'redis' });
    });
  }

  async get(key: string): Promise<string | null> {
    if (this._up) {
      try {
        return (await this._client.get(key)) || null;
      } catch (err) {
        this._logger.error({ error: err, method: 'redis-get' });
      }
    }

    const entry = this._memory.get(key);
    if (!entry) return null;
    if (entry.timeExpire < Date.now()) {
      this._memory.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds = 0): Promise<void> {
    if (this._up) {
      try {
        if (ttlSeconds > 0) {
          await this._client.set(key, value, { EX: ttlSeconds });
        } else {
          await this._client.set(key, value);
        }
        return;
      } catch (err) {
        this._logger.error({ error: err, method: 'redis-set' });
      }
    }

    this._memory.set(key, {
      value,
      timeExpire: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : Date.now() + 10_000,
    });
  }

  async clear(): Promise<void> {
    this._memory.clear();
    if (this._up) {
      try {
        await this._client.flushAll();
      } catch (err) {
        this._logger.error({ error: err, method: 'redis-flushall' });
      }
    }
  }
}
