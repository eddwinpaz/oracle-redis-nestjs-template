import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';
import { OracleRepository } from './infrastructure/oracle/oracle.repository';
import { RedisRepository } from './infrastructure/redis/redis.repository';
import { User } from './types/User';

describe('YourService', () => {
  let service: YourService;

  const mockOracleRepository = {
    findById: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockRedisRepository = {
    findById: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        { provide: OracleRepository, useValue: mockOracleRepository },
        { provide: RedisRepository, useValue: mockRedisRepository },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get data', async () => {
    const mockUser: User = { id: 1, name: 'test' };

    // Mock Redis to return null and Oracle to return the user
    mockRedisRepository.findById.mockResolvedValueOnce(null);
    mockOracleRepository.findById.mockResolvedValueOnce(mockUser);
    mockRedisRepository.save.mockResolvedValueOnce(undefined);

    const data = await service.getData('1');
    expect(data).toEqual(mockUser);
    expect(mockRedisRepository.findById).toHaveBeenCalledWith('1');
    expect(mockOracleRepository.findById).toHaveBeenCalledWith(
      'SELECT ID AS "id", NAME AS "name" FROM users WHERE ID = :id',
      '1',
    );
    expect(mockRedisRepository.save).toHaveBeenCalledWith('1', mockUser);
  });

  it('should create data', async () => {
    const data = { id: '2', name: 'test2' };

    mockOracleRepository.save.mockResolvedValueOnce(undefined);
    mockRedisRepository.save.mockResolvedValueOnce(undefined);

    await service.createData(data);
    expect(mockOracleRepository.save).toHaveBeenCalledWith(
      'INSERT INTO users (NAME) VALUES (:1)',
      [data.name],
    );
    expect(mockRedisRepository.save).toHaveBeenCalledWith(data.id, data);
  });

  it('should delete data', async () => {
    mockOracleRepository.delete.mockResolvedValueOnce(undefined);
    mockRedisRepository.delete.mockResolvedValueOnce(undefined);

    await service.deleteData('3');
    expect(mockOracleRepository.delete).toHaveBeenCalledWith(
      'DELETE FROM users WHERE ID = :id',
      '3',
    );
    expect(mockRedisRepository.delete).toHaveBeenCalledWith('3');
  });
});
