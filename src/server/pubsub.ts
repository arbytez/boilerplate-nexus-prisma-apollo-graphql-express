// import { PubSub } from 'graphql-subscriptions';
// const pubsub = new PubSub();
// export default pubsub;

import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

export const redisOptions: Redis.RedisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times: number) => {
    // reconnect after
    return Math.min(times * 50, 2000);
  },
};

const pubsub = new RedisPubSub({
  publisher: new Redis(redisOptions),
  subscriber: new Redis(redisOptions),
});

export default pubsub;
