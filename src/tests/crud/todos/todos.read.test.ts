import { todosWithLastCountInputQuery, todosWithFirstLastCountInputQuery } from './crudTodoQueries';
import {
  allTodosIdQuery,
  todosIdEqContentQuery,
  todosWithoutFirstLastQuery,
  todosWithFirstCountInputQuery,
} from './crudTodoQueries';
import {
  TestEnvironment,
  createNewTestEnvironment,
  cleanTestEnvironment,
  seedTestEnvironment,
  DbData,
} from '../../helpers/testUtils';

describe('todos crud api', () => {
  describe('read', () => {
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

    it('should return all todos (6)', async () => {
      const { todos } = await testEnvironment.graphQLClient.request(allTodosIdQuery);
      expect(todos).toHaveLength(6);
    });

    it('should return 1 filtered todo', async () => {
      const variables = { content: 'adminUser2' };
      const { todos } = await testEnvironment.graphQLClient.request(todosIdEqContentQuery, variables);
      expect(todos).toHaveLength(1);
    });

    it('should not fetch todos without fields first/last', async () => {
      try {
        const { todos } = await testEnvironment.graphQLClient.request(todosWithoutFirstLastQuery);
        expect('it was possible to fetch all todos without setting a query limit, but it is not allowed').toBe('');
      } catch (error) {
        expect(error.message).toMatch(/^(first|last) is a required field.*$/g);
      }
    });

    it('should not fetch todos with wrong field first/last', async () => {
      {
        const variables = { count: -1 };
        try {
          const { todos } = await testEnvironment.graphQLClient.request(todosWithFirstCountInputQuery, variables);
          expect('it was possible to fetch all todos with first field nagative value, but it is not allowed').toBe('');
        } catch (error) {
          expect(error.message).toMatch(/^first must be greater than or equal to.*$/g);
        }
        try {
          const { todos } = await testEnvironment.graphQLClient.request(todosWithLastCountInputQuery, variables);
          expect('it was possible to fetch all todos with last field nagative value, but it is not allowed').toBe('');
        } catch (error) {
          expect(error.message).toMatch(/^first is a required field.*$/g);
        }
      }

      {
        const variables = { count: 51 };
        try {
          const { todos } = await testEnvironment.graphQLClient.request(todosWithFirstCountInputQuery, variables);
          expect('it was possible to fetch all todos with first field greater than 50, but it is not allowed').toBe('');
        } catch (error) {
          expect(error.message).toMatch(/^first must be less than or equal to.*$/g);
        }
        try {
          const { todos } = await testEnvironment.graphQLClient.request(todosWithLastCountInputQuery, variables);
          expect('it was possible to fetch all todos with last field greater than 50, but it is not allowed').toBe('');
        } catch (error) {
          expect(error.message).toMatch(/^first is a required field.*$/g);
        }
      }

      {
        const variables = { firstCount: 51, lastCount: 10 };
        try {
          const { todos } = await testEnvironment.graphQLClient.request(todosWithFirstLastCountInputQuery, variables);
          expect(
            'it was possible to fetch all todos with first field greater than 50 (with both field), but it is not allowed'
          ).toBe('');
        } catch (error) {
          expect(error.message).toMatch(/^first must be less than or equal to.*$/g);
        }
      }

      {
        const variables = { firstCount: 10, lastCount: 51 };
        try {
          const { todos } = await testEnvironment.graphQLClient.request(todosWithFirstLastCountInputQuery, variables);
          expect(
            'it was possible to fetch all todos with last field greater than 50 (with both field), but it is not allowed'
          ).toBe('');
        } catch (error) {
          expect(error.message).toMatch(/^last must be less than or equal to.*$/g);
        }
      }
    });
  });
});
