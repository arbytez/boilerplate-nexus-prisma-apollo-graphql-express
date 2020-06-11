import Redis from 'ioredis';
import { Role } from '@prisma/client';
import { rule } from 'graphql-shield';
import { createRateLimitRule, RedisStore } from 'graphql-rate-limit';

import { Context } from '../../context';
import { redisOptions } from '../../../server/pubsub';

export const isAuthenticated = rule({ cache: 'contextual' })(
  async (parent, args, ctx: Context, info) => {
    if (ctx.connection) {
      return Boolean(ctx.connection.context.userId && ctx.connection.context.user);
    }
    return Boolean(ctx.userId && ctx.user);
  },
);

export const isRoot = rule({ cache: 'contextual' })(async (parent, args, ctx: Context, info) => {
  return Boolean(ctx.user && ctx.user.role === Role.ROOT);
});

export const isAdmin = rule({ cache: 'contextual' })(async (parent, args, ctx: Context, info) => {
  return Boolean(ctx.user && ctx.user.role === Role.ADMIN);
});

export const isUser = rule({ cache: 'contextual' })(async (parent, args, ctx: Context, info) => {
  return Boolean(ctx.user && ctx.user.role === Role.USER);
});

export const isTodoOwner = rule({ cache: 'strict' })(async (parent, args, ctx: Context, info) => {
  const todo = await ctx.prisma.todo.findOne({
    where: { id: args.input.id },
    include: { user: true },
  });
  return Boolean(ctx.userId && todo && todo.user.id === ctx.userId);
});

export const isUserOwner = rule({ cache: 'strict' })(async (parent, args, ctx: Context, info) => {
  // @ts-ignore
  const operationName = info.operation.selectionSet.selections[0]?.name?.value;
  if (operationName === 'SignIn' || operationName === 'SignUp') return true;
  return Boolean(parent.id && parent.id === ctx.userId);
});

export const rateLimitRule = createRateLimitRule({
  identifyContext: (ctx: Context) => ctx.req.ip,
  store: new RedisStore(new Redis(redisOptions)),
});
