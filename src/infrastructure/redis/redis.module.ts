// redis.module.ts
import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisRepository } from './redis.repository';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () =>
        new Redis({
          host: process.env.REDIS_HOST,
          port: 6379,
        }),
    },
    {
      provide: RedisRepository,
      useFactory: (redisClient: Redis) => new RedisRepository(redisClient),
      inject: ['REDIS_CLIENT'],
    },
  ],
  exports: [RedisRepository],
})
export class RedisModule {}
