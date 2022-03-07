import { Global, Module } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PUB_SUB } from './common.constants';

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useValue: new RedisPubSub(),
    },
  ],
  exports: [PUB_SUB],
})
export class CommonModule {}
