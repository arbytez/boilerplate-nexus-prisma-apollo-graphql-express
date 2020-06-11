import { objectType } from '@nexus/schema';

export const TodoSubscriptionPayload = objectType({
  name: 'TodoSubscriptionPayload',
  nonNullDefaults: { output: false },
  definition(t) {
    t.field('node', {
      type: 'TodoPayload',
      nullable: true,
    });
    t.field('mutation', { type: 'MutationType', nullable: false });
    t.list.string('updatedFields', { nullable: true });
    t.field('previousValues', { type: 'TodoPayload', nullable: true });
  },
});

export const TodoPayload = objectType({
  name: 'TodoPayload',
  definition(t) {
    t.model('Todo').id();
    t.model('Todo').createdAt();
    t.model('Todo').updatedAt();
    t.model('Todo').content();
    t.model('Todo').done();
    t.field('user', { type: 'User', nullable: true });
  },
});

export const Todo = objectType({
  name: 'Todo',
  definition(t) {
    t.model.id();
    t.model.createdAt();
    t.model.updatedAt();
    t.model.content();
    t.model.done();
    t.model.user();
  },
});
