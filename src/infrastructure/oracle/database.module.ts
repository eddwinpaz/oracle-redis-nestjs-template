// database.module.ts
import { Module } from '@nestjs/common';
import * as oracledb from 'oracledb';

@Module({
  providers: [
    {
      provide: 'ORACLE_CONNECTION',
      useFactory: async () => {
        return await oracledb.getConnection({
          user: process.env.ORACLE_USER,
          password: process.env.ORACLE_PASSWORD,
          connectString: process.env.ORACLE_CONNECTION_STRING,
        });
      },
    },
  ],
  exports: ['ORACLE_CONNECTION'],
})
export class DatabaseModule {}
