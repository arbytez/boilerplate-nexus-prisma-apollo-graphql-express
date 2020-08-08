import { v4 } from 'uuid';
import { GraphQLError } from 'graphql';
import { ApolloServer } from 'apollo-server-express';
import { User } from '@prisma/client';

import pubsub from './pubsub';
import signale from '../logger';
import { Context } from './context';
import { CustomConnectionParams } from '../@types/apollo/index';
import { getTokenFromReq } from '../helpers/utils';
import { validateToken, validateTokenAndGetUser } from '../helpers/auth';
import schema from './schema';
import { ErrorCode } from './enums';
import prismaClient from './prismaClient';
import { definitionLimit, depthLimit, fieldLimit } from './validation';

const validationRules =
  process.env.NODE_ENV === 'production'
    ? [depthLimit(3), definitionLimit(3), fieldLimit(20)]
    : [depthLimit(1000), definitionLimit(1000), fieldLimit(1000)];

function createServer() {
  return new ApolloServer({
    validationRules,
    schema,
    // @ts-ignore
    context: async ({ req, res, connection, payload }) => {
      if (connection && payload && payload.authorization) {
        const user = await validateTokenAndGetUser(payload.authorization);
        if (user) {
          req.user = user;
        }
      }
      const custCtx: Context = {
        req,
        res,
        connection,
        user: req ? (req.user as User) : undefined,
        userId: req && req.user ? (req.user as User).id : undefined,
        prisma: prismaClient,
        pubsub,
      };
      return custCtx;
    },
    subscriptions: {
      onConnect: async (connectionParams: CustomConnectionParams, webSocket: any) => {
        if (connectionParams && connectionParams.authorization) {
          const user = await validateTokenAndGetUser(connectionParams.authorization);
          if (user) {
            return { userId: user.id, user };
          }
        }
        if (webSocket && webSocket.upgradeReq) {
          const token = getTokenFromReq(webSocket.upgradeReq);
          const user = await validateTokenAndGetUser(token);
          if (user) {
            return { userId: user.id, user };
          }
        }
        return {};
      },
    },
    formatError: (error: GraphQLError) => {
      try {
        if (error?.extensions?.code === ErrorCode.VALIDATION_FAILED) {
          const errMessages = error?.extensions?.validationErrors?.map((valErr: any) =>
            valErr.map((err: any) => err.message),
          );
          return new GraphQLError(
            errMessages[0].map((message: string) =>
              message.replace('input.', '').replace('data.', ''),
            ),
          );
        }
        if (
          error?.extensions?.code !== ErrorCode.INTERNAL_ERROR &&
          error?.extensions?.code !== ErrorCode.UNKNOWN &&
          (error?.extensions?.code in ErrorCode ||
            error?.extensions?.code === 'GRAPHQL_PARSE_FAILED' ||
            error?.extensions?.code === 'GRAPHQL_VALIDATION_FAILED' ||
            error?.message.includes('GraphQL introspection is not allowed') ||
            error?.message.includes('was not provided.') ||
            error?.message.includes('Expected type') ||
            error?.message.includes('Cannot query') ||
            error?.message.includes('is never used in operation') ||
            error?.message.includes('is not defined by operation') ||
            error?.message.includes('got invalid value'))
        ) {
          return new GraphQLError(error.message);
        }
        if (error?.extensions?.exception?.name === 'ValidationError') {
          return new GraphQLError(
            error?.extensions?.exception?.errors
              .reverse()
              .map((message: string) => message.replace('input.', '').replace('data.', '')),
          );
        }
        if (error?.extensions?.exception?.isRateLimitError) {
          return new GraphQLError('Too many requests, please try again later.');
        }
      } catch (e) {
        signale.error(e);
      }
      const errId = v4();
      signale.error(`errId ${errId}\n`, JSON.stringify(error, null, 2));
      // TODO save error on db?
      return new GraphQLError(`Internal Error: ${errId}`);
    },
  });
}

export default createServer;
