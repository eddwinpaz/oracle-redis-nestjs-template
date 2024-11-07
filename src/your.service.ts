import { Injectable } from '@nestjs/common';
import { OracleRepository } from './infrastructure/oracle/oracle.repository';
import { RedisRepository } from './infrastructure/redis/redis.repository';
import { User } from './types/User';

@Injectable()
export class YourService {
  constructor(
    private readonly oracleRepository: OracleRepository,
    private readonly redisRepository: RedisRepository,
  ) {}

  // async getData(id: string): Promise<any> {
  //   // Check if data is cached in Redis
  //   let data = await this.redisRepository.findById(id);
  //   if (data) return data;

  //   // If not in cache, fetch from Oracle and cache it
  //   const query = 'SELECT * FROM users WHERE ID = :id';
  //   data = await this.oracleRepository.findById(query, id);
  //   if (data) {
  //     await this.redisRepository.save(id, data);
  //   }
  //   return data;
  // }

  async getData(id: string): Promise<any | null> {
    const data: User | null = await this.redisRepository.findById(id);
    if (data) return data;

    const query = 'SELECT ID AS "id", NAME AS "name" FROM users WHERE ID = :id';
    const result: User = await this.oracleRepository.findById(query, id);

    if (result) await this.redisRepository.save(id, result);
    return result;
  }

  async createData(data: any): Promise<void> {
    const query = `INSERT INTO users (NAME) VALUES (:1)`;
    await this.oracleRepository.save(query, [data.name]);
    await this.redisRepository.save(data.id, data);
  }

  async deleteData(id: string): Promise<void> {
    const query = 'DELETE FROM users WHERE ID = :id';
    await this.oracleRepository.delete(query, id);
    await this.redisRepository.delete(id);
  }
}
