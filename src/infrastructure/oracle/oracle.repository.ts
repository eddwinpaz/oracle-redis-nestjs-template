import { Inject, Injectable } from '@nestjs/common';
import { Connection, OUT_FORMAT_OBJECT } from 'oracledb';

@Injectable()
export class OracleRepository {
  constructor(
    @Inject('ORACLE_CONNECTION') private readonly connection: Connection,
  ) {}

  // Execute a stored procedure or query and return the result
  async executeQuery(query: string, params: any[] = []): Promise<any[]> {
    const result = await this.connection.execute(query, params);
    return result.rows || [];
  }

  async findById<T>(query: string, id: any): Promise<T | null> {
    const result = await this.connection.execute(query, [id], {
      outFormat: OUT_FORMAT_OBJECT,
    });
    return result.rows ? (result.rows[0] as T) : null;
  }

  // async save(query: string, params: any[]): Promise<void> {
  //   await this.connection.execute(query, params);
  //   await this.connection.commit();
  // }

  async save(query: string, params: any[]): Promise<void> {
    try {
      await this.connection.execute(query, params, {
        autoCommit: false,
      });
      if (this.connection) await this.connection.commit();
    } catch (error) {
      if (this.connection) await this.connection.rollback();
      throw error;
    }
    // finally {
    //   if (this.connection) await this.connection.close();
    // }
  }

  // async delete(query: string, id: any): Promise<void> {
  //   await this.connection.execute(query, [id]);
  //   await this.connection.commit();
  // }

  async delete(query: string, id: any): Promise<void> {
    try {
      await this.connection.execute(query, [id], {
        autoCommit: false,
      });
      if (this.connection) await this.connection.commit();
    } catch (error) {
      if (this.connection) await this.connection.rollback();
      throw error;
    }
    //  finally {
    //   if (this.connection) await this.connection.close();
    // }
  }
}
