import { todosIdEqContentQuery, updateTodoMutation } from './crudTodoQueries';
import {
  TestEnvironment,
  createNewTestEnvironment,
  cleanTestEnvironment,
  seedTestEnvironment,
  DbData,
} from '../../helpers/testUtils';

describe('todos crud api', () => {
  describe('update', () => {
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

    it('should update the todo (todo owned by user)', async () => {
      const variables = { input: { id: dbData.todos[0].id, content: 'updated by user' } };
      testEnvironment.graphQLClient.setHeader('authorization', dbData.userToken);
      await testEnvironment.graphQLClient.request(updateTodoMutation, variables);

      const { todos } = await testEnvironment.graphQLClient.request(todosIdEqContentQuery, {
        content: 'updated by user',
      });
      expect(todos).toHaveLength(1);
      expect(todos[0].content).toBe('updated by user');
    });
  });
});
