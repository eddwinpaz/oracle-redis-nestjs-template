import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ONE_WEEK_IN_SECONDS } from './ttl_time_config';

@Injectable()
export class RedisRepository {
  private readonly ttl: number = ONE_WEEK_IN_SECONDS;

  constructor(private readonly redisClient: Redis) {}

  // Get data from cache by key
  async findById<T>(key: string): Promise<T | null> {
    const data = await this.redisClient.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  async save(key: string, value: any, ttl: number = this.ttl): Promise<void> {
    await this.redisClient.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
