import { Test, TestingModule } from '@nestjs/testing';
import { OracleRepository } from './oracle.repository';
import { Connection, OUT_FORMAT_OBJECT } from 'oracledb';

describe('OracleRepository', () => {
  let oracleRepository: OracleRepository;
  let mockConnection: Partial<jest.Mocked<Connection>>;

  beforeEach(async () => {
    // Create a partial mock for Connection with the methods used
    mockConnection = {
      execute: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OracleRepository,
        {
          provide: 'ORACLE_CONNECTION',
          useValue: mockConnection,
        },
      ],
    }).compile();

    oracleRepository = module.get<OracleRepository>(OracleRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executeQuery', () => {
    it('should execute a query and return rows', async () => {
      const query = 'SELECT * FROM users';
      const mockRows = [{ id: '1', name: 'test' }];
      const mockExecuteResult = { rows: mockRows };

      (mockConnection.execute as jest.Mock).mockResolvedValueOnce(
        mockExecuteResult,
      );

      const result = await oracleRepository.executeQuery(query);
      expect(result).toEqual(mockRows);
      expect(mockConnection.execute).toHaveBeenCalledWith(query, []);
    });

    it('should return an empty array if no rows are found', async () => {
      const query = 'SELECT * FROM users';
      const mockExecuteResult = { rows: null };

      (mockConnection.execute as jest.Mock).mockResolvedValueOnce(
        mockExecuteResult,
      );

      const result = await oracleRepository.executeQuery(query);
      expect(result).toEqual([]);
      expect(mockConnection.execute).toHaveBeenCalledWith(query, []);
    });
  });

  describe('findById', () => {
    it('should execute a query with an ID and return the first row', async () => {
      const query = 'SELECT * FROM users WHERE id = :id';
      const id = '1';
      const mockRow = { id: '1', name: 'test' };
      const mockExecuteResult = { rows: [mockRow] };

      (mockConnection.execute as jest.Mock).mockResolvedValueOnce(
        mockExecuteResult,
      );

      const result = await oracleRepository.findById<typeof mockRow>(query, id);
      expect(result).toEqual(mockRow);
      expect(mockConnection.execute).toHaveBeenCalledWith(query, [id], {
        outFormat: OUT_FORMAT_OBJECT,
      });
    });

    it('should return null if no row is found', async () => {
      const query = 'SELECT * FROM users WHERE id = :id';
      const id = '2';
      const mockExecuteResult = { rows: [] };

      (mockConnection.execute as jest.Mock).mockResolvedValueOnce(
        mockExecuteResult,
      );

      const result = await oracleRepository.findById(query, id);
      expect(result).toBeNull();
      expect(mockConnection.execute).toHaveBeenCalledWith(query, [id], {
        outFormat: OUT_FORMAT_OBJECT,
      });
    });
  });

  describe('save', () => {
    it('should execute a save query and commit the transaction', async () => {
      const query = 'INSERT INTO users (name) VALUES (:name)';
      const params = ['test'];

      await oracleRepository.save(query, params);

      expect(mockConnection.execute).toHaveBeenCalledWith(query, params, {
        autoCommit: false,
      });
      expect(mockConnection.commit).toHaveBeenCalled();
    });

    it('should rollback the transaction if an error occurs', async () => {
      const query = 'INSERT INTO users (name) VALUES (:name)';
      const params = ['test'];
      (mockConnection.execute as jest.Mock).mockRejectedValueOnce(
        new Error('Test error'),
      );

      await expect(oracleRepository.save(query, params)).rejects.toThrow(
        'Test error',
      );
      expect(mockConnection.rollback).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should execute a delete query and commit the transaction', async () => {
      const query = 'DELETE FROM users WHERE id = :id';
      const id = '1';

      await oracleRepository.delete(query, id);

      expect(mockConnection.execute).toHaveBeenCalledWith(query, [id], {
        autoCommit: false,
      });
      expect(mockConnection.commit).toHaveBeenCalled();
    });

    it('should rollback the transaction if an error occurs', async () => {
      const query = 'DELETE FROM users WHERE id = :id';
      const id = '1';
      (mockConnection.execute as jest.Mock).mockRejectedValueOnce(
        new Error('Test error'),
      );

      await expect(oracleRepository.delete(query, id)).rejects.toThrow(
        'Test error',
      );
      expect(mockConnection.rollback).toHaveBeenCalled();
    });
  });
});
