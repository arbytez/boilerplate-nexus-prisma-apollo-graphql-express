import { allTodosIdQuery, createTodoMutation } from './crudTodoQueries';
import {
  TestEnvironment,
  createNewTestEnvironment,
  cleanTestEnvironment,
  seedTestEnvironment,
  DbData,
} from '../../helpers/testUtils';

describe('todos crud api', () => {
  describe('create', () => {
    let testEnvironment: TestEnvironment;
    let dbData: DbData;

    beforeAll(async () => {
      testEnvironment = createNewTestEnvironment();
      dbData = await seedTestEnvironment(testEnvironment);
    });

    afterAll(async () => {
      await cleanTestEnvironment(testEnvironment);
    });

    beforeEach(() => {
      testEnvironment.graphQLClient.setHeader('authorization', '');
    });

    it('should return 9 todos (3 created)', async () => {
      const variables = [
        { input: { content: 'created by user' } },
        { input: { content: 'created by admin' } },
        { input: { content: 'created by root' } },
      ];
      testEnvironment.graphQLClient.setHeader('authorization', dbData.userToken);
      await testEnvironment.graphQLClient.request(createTodoMutation, variables[0]);

      testEnvironment.graphQLClient.setHeader('authorization', dbData.adminToken);
      await testEnvironment.graphQLClient.request(createTodoMutation, variables[1]);

      testEnvironment.graphQLClient.setHeader('authorization', dbData.rootToken);
      await testEnvironment.graphQLClient.request(createTodoMutation, variables[2]);

      const { todos } = await testEnvironment.graphQLClient.request(allTodosIdQuery);
      expect(todos).toHaveLength(9);
    });
  });
});
