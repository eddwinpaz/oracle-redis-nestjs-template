import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/oracle/database.module';
import { OracleRepository } from './infrastructure/oracle/oracle.repository';
import { YourService } from './your.service';
import { RedisModule } from './infrastructure/redis/redis.module';

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [],
  providers: [OracleRepository, YourService],
})
export class AppModule {}
