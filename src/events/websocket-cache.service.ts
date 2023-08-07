import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '../cache/redis-cache.service';

@Injectable()
export class SocketCacheService {
  constructor(private readonly redisCacheService: RedisCacheService) {}

  private socketCacheKey(userId: number): string {
    return `cache:socket:${userId}`;
  }

  getCachedSocketId(userId: number): Promise<string> {
    return this.redisCacheService.get(this.socketCacheKey(userId));
  }

  cacheSocketId(userId: number, socketId: string): Promise<void> {
    return this.redisCacheService.set(this.socketCacheKey(userId), socketId);
  }

  deleteCachedSocketId(userId: number): Promise<void> {
    return this.redisCacheService.del(this.socketCacheKey(userId));
  }
}
