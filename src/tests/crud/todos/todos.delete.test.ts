import { deleteTodoMutation, allTodosIdQuery } from './crudTodoQueries';
import {
  TestEnvironment,
  createNewTestEnvironment,
  cleanTestEnvironment,
  seedTestEnvironment,
  DbData,
} from '../../helpers/testUtils';

describe('todos crud api', () => {
  describe('delete', () => {
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

    it('should remain 4 todos (delete all user todos (2))', async () => {
      const variables = [{ input: { id: dbData.todos[0].id } }, { input: { id: dbData.todos[1].id } }];
      testEnvironment.graphQLClient.setHeader('authorization', dbData.userToken);
      await testEnvironment.graphQLClient.request(deleteTodoMutation, variables[0]);
      await testEnvironment.graphQLClient.request(deleteTodoMutation, variables[1]);

      const { todos } = await testEnvironment.graphQLClient.request(allTodosIdQuery);
      expect(todos).toHaveLength(4);
    });
  });
});
