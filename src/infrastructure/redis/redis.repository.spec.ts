import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import { RedisRepository } from './redis.repository';
import { ONE_WEEK_IN_SECONDS } from './ttl_time_config';

jest.mock('ioredis');

describe('RedisRepository', () => {
  let redisRepository: RedisRepository;
  let redisClient: Redis;

  beforeEach(async () => {
    redisClient = new Redis();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisRepository,
        {
          provide: Redis,
          useValue: redisClient,
        },
      ],
    }).compile();

    redisRepository = module.get<RedisRepository>(RedisRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return parsed data from Redis if the key exists', async () => {
      const key = 'test-key';
      const mockData = { foo: 'bar' };
      jest
        .spyOn(redisClient, 'get')
        .mockResolvedValue(JSON.stringify(mockData));

      const result = await redisRepository.findById<typeof mockData>(key);

      expect(redisClient.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(mockData);
    });

    it('should return null if the key does not exist in Redis', async () => {
      const key = 'non-existent-key';
      jest.spyOn(redisClient, 'get').mockResolvedValue(null);

      const result = await redisRepository.findById(key);

      expect(redisClient.get).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save data with default TTL if no TTL is provided', async () => {
      const key = 'test-key';
      const value = { foo: 'bar' };
      const ttl = ONE_WEEK_IN_SECONDS;

      const setSpy = jest.spyOn(redisClient, 'set').mockResolvedValue('OK');

      await redisRepository.save(key, value);

      expect(setSpy).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        'EX',
        ttl,
      );
    });

    it('should save data with specified TTL if TTL is provided', async () => {
      const key = 'test-key';
      const value = { foo: 'bar' };
      const customTtl = 3600;

      const setSpy = jest.spyOn(redisClient, 'set').mockResolvedValue('OK');

      await redisRepository.save(key, value, customTtl);

      expect(setSpy).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        'EX',
        customTtl,
      );
    });
  });

  describe('delete', () => {
    it('should delete data from Redis by key', async () => {
      const key = 'test-key';

      const delSpy = jest.spyOn(redisClient, 'del').mockResolvedValue(1);

      await redisRepository.delete(key);

      expect(delSpy).toHaveBeenCalledWith(key);
    });
  });
});
