import { Global, Module } from '@nestjs/common';
import { Redis } from 'ioredis';

@Module({
  controllers: [],
  providers: [{
    provide: 'REDIS_CLIENT',
    useFactory: () => {
      const redis = new Redis()
      console.log('Redis connected')
      redis.get('notification-mails', (err, result) => {
        err ? console.error('Error getting data from Redis:', err) : console.log('Data from Redis:', result);
      });
      // redis.set('notification-mails', JSON.stringify([]))
      return redis
    },
  }],
  exports: ['REDIS_CLIENT'],
})

export class RedisModule { }
