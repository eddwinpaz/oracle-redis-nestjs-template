import { GenericContainer } from 'testcontainers';
import { Redis } from 'ioredis';
import { RedisRepository } from './redis.repository';
import { Test, TestingModule } from '@nestjs/testing';

describe('RedisRepository', () => {
  let container;
  let redisClient: Redis;
  let repository: RedisRepository;

  beforeAll(async () => {
    container = await new GenericContainer('redis')
      .withExposedPorts(6379)
      .start();
    redisClient = new Redis({
      host: container.getHost(),
      port: container.getMappedPort(6379),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RedisRepository,
          useFactory: (redisClient: Redis) => new RedisRepository(redisClient),
          inject: [Redis],
        },
      ],
    }).compile();

    repository = module.get<RedisRepository>(RedisRepository);
  });

  afterAll(async () => {
    await redisClient.quit();
    container.stop();
  });

  it('should get data from cache by key', async () => {
    await repository.save('key', 'value');
    const data = await repository.findById('key');
    expect(data).toEqual('value');
  });

  it('should delete data from cache by key', async () => {
    await repository.save('key', 'value');
    const data = await repository.delete('key');
    expect(data).toEqual('value');
  });
});
