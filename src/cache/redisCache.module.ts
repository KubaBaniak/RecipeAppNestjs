import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { RedisCacheService } from './redisCache.service';

@Module({
  imports: [
    CacheModule.register({
      imports: [ConfigModule],
      useFactory: async () => ({
        store: redisStore,
        url: 'redis://localhost:6379',
        password: process.env.REQUIRE_PASS_REDIS,
      }),
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
