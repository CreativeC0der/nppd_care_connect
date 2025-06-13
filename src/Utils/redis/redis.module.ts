import { Global, Module } from '@nestjs/common';
import { Redis } from 'ioredis';

@Module({
  controllers: [],
  providers: [{
    provide: 'REDIS_CLIENT',
    useFactory: () => {
      const redis = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT!)
      })
      console.log('Redis connected')
      // redis.set('notification-mails', JSON.stringify([]))
      return redis
    },
  }],
  exports: ['REDIS_CLIENT'],
})

export class RedisModule { }
