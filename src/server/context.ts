import { Photon, User } from '@prisma/photon';
import { Request, Response } from 'express-serve-static-core';
import { ExecutionParams } from 'subscriptions-transport-ws';
import { RedisPubSub } from 'graphql-redis-subscriptions';

interface CustomExecutionParams extends ExecutionParams {
  context: {
    userId?: string | number;
    user?: User;
  };
}

export interface Context {
  req: Request;
  res: Response;
  connection?: CustomExecutionParams;
  user?: User;
  userId?: string | number;
  photon: Photon;
  pubsub: RedisPubSub;
}
