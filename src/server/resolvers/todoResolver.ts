import { extendType, subscriptionField, inputObjectType, arg } from '@nexus/schema';

import { SubscriptionTrigger, MutationType, ErrorCode } from '../enums';
import { createApolloError } from '../../helpers/utils';

export const todoNexusQuery = extendType({
  type: 'Query',
  definition(t) {
    t.crud.todo();
    t.crud.todos({ filtering: true, ordering: true, pagination: true });
  },
});

export const CreateTodoInput = inputObjectType({
  name: 'CreateTodoInput',
  nonNullDefaults: { input: true },
  definition(t) {
    t.string('content');
    t.boolean('done', { default: false });
  },
});

export const UpdateTodoInput = inputObjectType({
  name: 'UpdateTodoInput',
  definition(t) {
    t.id('id', { nullable: false });
    t.string('content');
    t.boolean('done');
  },
});

export const DeleteTodoInput = inputObjectType({
  name: 'DeleteTodoInput',
  nonNullDefaults: { input: true },
  definition(t) {
    t.id('id');
  },
});

export const todoMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createTodo', {
      type: 'Todo',
      args: {
        input: arg({ type: 'CreateTodoInput', nullable: false }),
      },
      async resolve(_root, { input: { content, done } }, ctx, _info) {
        content = content.trim();
        const newTodo = await ctx.prisma.todo.create({
          data: { content, done, user: { connect: { id: String(ctx.userId) } } },
        });
        const todoSubscriptionPayload = {
          mutation: MutationType.CREATED,
          node: { ...newTodo },
        };
        ctx.pubsub.publish(SubscriptionTrigger.TODO_EVENT, { ...todoSubscriptionPayload });
        return newTodo;
      },
    });
    t.field('updateTodo', {
      type: 'Todo',
      args: {
        input: arg({ type: 'UpdateTodoInput', nullable: false }),
      },
      async resolve(_root, { input }, ctx, _info) {
        const id = input.id;
        const content = input.content || undefined;
        const done = input.done || undefined;
        const updatedFields: string[] = [];
        if (typeof content === 'string') updatedFields.push('content');
        if (typeof done === 'boolean') updatedFields.push('done');
        const todoToUpdate = await ctx.prisma.todo.findOne({
          where: { id },
          include: { user: true },
        });
        if (!todoToUpdate) {
          throw createApolloError(ErrorCode.RESOURCE_ID_NOT_FOUND, [id]);
        }
        const todoUpdated = await ctx.prisma.todo.update({
          where: { id },
          data: { content, done },
        });
        const todoSubscriptionPayload = {
          mutation: MutationType.UPDATED,
          node: { ...todoUpdated },
          previousValues: { ...todoToUpdate },
          updatedFields,
        };
        ctx.pubsub.publish(SubscriptionTrigger.TODO_EVENT, { ...todoSubscriptionPayload });
        return todoUpdated;
      },
    });
    t.field('deleteTodo', {
      type: 'TodoPayload',
      args: {
        input: arg({ type: 'DeleteTodoInput', nullable: false }),
      },
      async resolve(_root, { input: { id } }, ctx, _info) {
        const todoToDelete = await ctx.prisma.todo.findOne({
          where: { id },
          include: { user: true },
        });
        if (!todoToDelete) {
          throw createApolloError(ErrorCode.RESOURCE_ID_NOT_FOUND, [id]);
        }
        const todoDeleted = await ctx.prisma.todo.delete({ where: { id } });
        const todoSubscriptionPayload = {
          mutation: MutationType.DELETED,
          node: { ...todoDeleted },
          previousValues: { ...todoToDelete },
        };
        ctx.pubsub.publish(SubscriptionTrigger.TODO_EVENT, { ...todoSubscriptionPayload });
        return todoDeleted;
      },
    });
  },
});

export const todoNexusMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.crud.createOneTodo();
    t.crud.updateOneTodo();
    t.crud.upsertOneTodo();
    t.crud.deleteOneTodo();

    t.crud.updateManyTodo();
    t.crud.deleteManyTodo();
  },
});

export const todoSubscription = subscriptionField('todoEvents', {
  type: 'TodoSubscriptionPayload',
  subscribe: (_root, _args, ctx, _info) => {
    return ctx.pubsub.asyncIterator(SubscriptionTrigger.TODO_EVENT);
  },
  resolve: (payload) => {
    return payload;
  },
});
