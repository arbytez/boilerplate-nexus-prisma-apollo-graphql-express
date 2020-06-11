import { objectType } from '@nexus/schema';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.field('id', { type: 'ID', nullable: true }); // t.model.id();
    t.field('createdAt', { type: 'DateTime', nullable: true }); // t.model.createdAt();
    t.field('updatedAt', { type: 'DateTime', nullable: true }); // t.model.updatedAt();
    t.field('email', { type: 'String', nullable: true }); // t.model.email();
    t.model.username();
    t.field('role', { type: 'Role', nullable: true }); // t.model.role();
    t.model.todos();
  },
});

export const UserWithToken = objectType({
  name: 'UserWithToken',
  nonNullDefaults: { output: false },
  definition(t) {
    t.field('user', { type: 'User' });
    t.string('token');
  },
});
