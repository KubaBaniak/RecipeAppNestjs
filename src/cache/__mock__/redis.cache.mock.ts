import { RedisCacheService } from '../redisCache.service';

export class MockRedisCacheService implements Required<RedisCacheService> {
  get(_key: string): Promise<any> {
    return Promise.resolve();
  }

  set(_key: string): Promise<void> {
    return Promise.resolve();
  }

  del(_key: string): Promise<void> {
    return Promise.resolve();
  }
}
