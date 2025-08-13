import { Global, Module } from '@nestjs/common';
import { Redis } from 'ioredis';

@Module({
  controllers: [],
  providers: [{
    provide: 'REDIS_CLIENT',
    useFactory: () => {
      const redis = new Redis(
        process.env.REDIS_URL!,
        // if production, use tls
        process.env.ENVIRONMENT == 'production' ? {
          tls: {
            rejectUnauthorized: false
          }
        } : {});
      console.log('Redis connected')
      return redis
    },
  }],
  exports: ['REDIS_CLIENT'],
})

export class RedisModule { }
