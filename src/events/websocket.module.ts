import { Module } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { SocketCacheService } from './websocket-cache.service';
import { RedisCacheModule } from '../cache/redis-cache.module';

@Module({
  imports: [RedisCacheModule],
  providers: [WebsocketService, SocketCacheService],
  exports: [WebsocketService],
})
export class WebsocketModule {}
