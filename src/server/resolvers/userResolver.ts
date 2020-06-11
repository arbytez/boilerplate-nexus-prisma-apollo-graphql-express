import { queryType, extendType } from '@nexus/schema';

export const userNexusQuery = extendType({
  type: 'Query',
  definition(t) {
    t.crud.user();
    t.crud.users({ filtering: true, ordering: true, pagination: true });
  },
});

export const userNexusMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.crud.createOneUser();
    t.crud.updateOneUser();
    t.crud.upsertOneUser();
    t.crud.deleteOneUser();

    t.crud.updateManyUser();
    t.crud.deleteManyUser();
  },
});
