import { todosWithUserDataQuery } from './permissionsQueries';
import {
  userQuery,
  usersQuery,
  createTodoMutation,
  updateTodoMutation,
  deleteTodoMutation,
  todosWithUsernameQuery,
} from './permissionsQueries';
import {
  TestEnvironment,
  createNewTestEnvironment,
  cleanTestEnvironment,
  seedTestEnvironment,
  DbData,
} from '../../helpers/testUtils';

describe('permissions middleware', () => {
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

  it('only admin/root users can execute queries user/users', async () => {
    const variables = { where: { id: dbData.users[0].id } };

    // guest
    try {
      const res = await testEnvironment.graphQLClient.request(userQuery, variables);
      expect('').toEqual('a guest fetched a user, but he could not do it');
    } catch (error) {
      expect(error.message).toMatch(/^Not authorized.*$/g);
    }
    try {
      const res = await testEnvironment.graphQLClient.request(usersQuery);
      expect('').toEqual('a guest fetched users, but he could not do it');
    } catch (error) {
      expect(error.message).toMatch(/^Not authorized.*$/g);
    }

    // user account
    testEnvironment.graphQLClient.setHeader('authorization', dbData.userToken);
    try {
      const res = await testEnvironment.graphQLClient.request(userQuery, variables);
      expect('').toEqual('a user account fetched a user, but he could not do it');
    } catch (error) {
      expect(error.message.startsWith(`Not authorized`)).toBe(true);
    }
    try {
      const res = await testEnvironment.graphQLClient.request(usersQuery);
      expect('').toEqual('a user account fetched users, but he could not do it');
    } catch (error) {
      expect(error.message.startsWith(`Not authorized`)).toBe(true);
    }

    // admin account
    {
      testEnvironment.graphQLClient.setHeader('authorization', dbData.adminToken);
      const { user } = await testEnvironment.graphQLClient.request(userQuery, variables);
      expect(user.id).toBe(dbData.users[0].id);
      const { users } = await testEnvironment.graphQLClient.request(usersQuery);
      expect(users).toHaveLength(3);
    }

    // root account
    {
      testEnvironment.graphQLClient.setHeader('authorization', dbData.rootToken);
      const { user } = await testEnvironment.graphQLClient.request(userQuery, variables);
      expect(user.id).toBe(dbData.users[0].id);
      const { users } = await testEnvironment.graphQLClient.request(usersQuery);
      expect(users).toHaveLength(3);
    }
  });

  it('a guest account should not be able to create/update/delete todo', async () => {
    {
      // create
      const variables = { input: { content: 'newTodo', done: false } };
      try {
        const res = await testEnvironment.graphQLClient.request(createTodoMutation, variables);
        expect(false).toBe(true); // fail the test if no error is thrown
      } catch (error) {
        expect(error.message.startsWith(`Not authorized`)).toBe(true);
      }
    }
    {
      // update
      const variables = { input: { id: dbData.todos[0].id, content: 'new data' } };
      try {
        const res = await testEnvironment.graphQLClient.request(updateTodoMutation, variables);
        expect(false).toBe(true); // fail the test if no error is thrown
      } catch (error) {
        expect(error.message.startsWith(`Not authorized`)).toBe(true);
      }
    }
    {
      // delete
      const variables = { input: { id: dbData.todos[0].id } };
      try {
        const res = await testEnvironment.graphQLClient.request(deleteTodoMutation, variables);
        expect(false).toBe(true); // fail the test if no error is thrown
      } catch (error) {
        expect(error.message.startsWith(`Not authorized`)).toBe(true);
      }
    }
  });

  it('a user account should not be able to update/delete a not owned todo', async () => {
    testEnvironment.graphQLClient.setHeader('authorization', dbData.userToken);
    {
      // update
      const variables = { input: { id: dbData.todos[2].id, content: 'new data' } };
      try {
        const res = await testEnvironment.graphQLClient.request(updateTodoMutation, variables);
        expect(false).toBe(true); // fail the test if no error is thrown
      } catch (error) {
        expect(error.message.startsWith(`Not authorized`)).toBe(true);
      }
    }
    {
      // delete
      const variables = { input: { id: dbData.todos[2].id } };
      try {
        const res = await testEnvironment.graphQLClient.request(deleteTodoMutation, variables);
        expect(false).toBe(true); // fail the test if no error is thrown
      } catch (error) {
        expect(error.message.startsWith(`Not authorized`)).toBe(true);
      }
    }
  });

  it('admin/root account should be able to update/delete a not owned todo', async () => {
    // admin
    testEnvironment.graphQLClient.setHeader('authorization', dbData.adminToken);
    {
      // update
      const variables = { input: { id: dbData.todos[0].id, content: 'new data' } };
      const { updateTodo } = await testEnvironment.graphQLClient.request(updateTodoMutation, variables);
      expect(updateTodo.id).toBe(dbData.todos[0].id);
      expect(updateTodo.content).toBe('new data');
    }
    {
      // delete
      const variables = { input: { id: dbData.todos[0].id } };
      const { deleteTodo } = await testEnvironment.graphQLClient.request(deleteTodoMutation, variables);
      expect(deleteTodo.id).toBe(dbData.todos[0].id);
    }

    // root
    testEnvironment.graphQLClient.setHeader('authorization', dbData.rootToken);
    {
      // update
      const variables = { input: { id: dbData.todos[1].id, content: 'new data' } };
      const { updateTodo } = await testEnvironment.graphQLClient.request(updateTodoMutation, variables);
      expect(updateTodo.id).toBe(dbData.todos[1].id);
      expect(updateTodo.content).toBe('new data');
    }
    {
      // delete
      const variables = { input: { id: dbData.todos[1].id } };
      const { deleteTodo } = await testEnvironment.graphQLClient.request(deleteTodoMutation, variables);
      expect(deleteTodo.id).toBe(dbData.todos[1].id);
    }
  });

  it('a user account should be able to see only the username and todos of another user account', async () => {
    testEnvironment.graphQLClient.setHeader('authorization', dbData.userToken);
    const { todos } = await testEnvironment.graphQLClient.request(todosWithUsernameQuery);
    expect(todos.length).toBeGreaterThan(0);
    try {
      const res = await testEnvironment.graphQLClient.request(todosWithUserDataQuery);
      expect(false).toBe(true); // fail the test if no error is thrown
    } catch (error) {
      expect(error.message.startsWith(`Not authorized`)).toBe(true);
    }
  });
});
