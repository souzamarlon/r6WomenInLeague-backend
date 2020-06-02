import Redis from 'ioredis';

class Cache {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASS,
      keyPrefix: 'cache:',
    });
  }

  // 60 seconds * 60 minutes * 24 hours = it will take 24 hours to expire the cache.
  set(key, value) {
    return this.redis.set(key, JSON.stringify(value), 'EX', 60 * 60 * 24);
  }

  async get(key) {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  invalidate(key) {
    return this.redis.del(key);
  }

  async invalidatePrefix(prefix) {
    try {
      const keys = await this.redis.keys(`cache:${prefix}:*`);

      if (keys.length) {
        const keysWithoutPrefix = keys.map((key) => key.replace('cache:', ''));

        const keyDeleted = await this.redis.del(keysWithoutPrefix);

        return keyDeleted;
      }
    } catch (err) {
      console.log(err);
    }
  }
}

export default new Cache();
