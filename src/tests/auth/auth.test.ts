import { Role, User } from '@prisma/client';

import { signInMutation, signUpMutation, signOutMutation, meQuery } from './authQueries';
import {
  TestEnvironment,
  createNewTestEnvironment,
  cleanTestEnvironment,
  seedTestEnvironment,
  DbData,
} from '../helpers/testUtils';

describe('auth operations', () => {
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

  it('should sign in correctly', async () => {
    const variables = { input: { email: 'testUser@example.com', password: 'testUser' } };
    const { SignIn } = await testEnvironment.graphQLClient.request(signInMutation, variables);
    const { user, token } = SignIn;
    expect(user.id).toBe(dbData.users[0].id);
    expect(user.username).toBe(dbData.users[0].username);
    expect(user.email).toBe(dbData.users[0].email);
    expect(user.role).toBe(dbData.users[0].role);
    expect(token.length).toBeGreaterThan(20);
  });

  it('should not sign in correctly with wrong email input', async () => {
    let variables = { input: { email: '', password: 'testUser' } };
    try {
      const res = await testEnvironment.graphQLClient.request(signInMutation, variables);
      expect(false).toBe(true); // fail the test if no error is thrown
    } catch (error) {
      expect(error.message.startsWith(`email is a required field`)).toBe(true);
    }
    variables = { input: { email: 'testUser', password: 'testUser' } };
    try {
      const res = await testEnvironment.graphQLClient.request(signInMutation, variables);
      expect(false).toBe(true); // fail the test if no error is thrown
    } catch (error) {
      expect(error.message.startsWith(`email must be a valid email`)).toBe(true);
    }
  });

  it('should not sign in correctly with wrong password input', async () => {
    let variables = { input: { email: 'testUser@example.com', password: '' } };
    try {
      const res = await testEnvironment.graphQLClient.request(signInMutation, variables);
      expect(false).toBe(true); // fail the test if no error is thrown
    } catch (error) {
      expect(error.message.startsWith(`password is a required field`)).toBe(true);
    }
    variables = { input: { email: 'testUser@example.com', password: 'test' } };
    try {
      const res = await testEnvironment.graphQLClient.request(signInMutation, variables);
      expect(false).toBe(true); // fail the test if no error is thrown
    } catch (error) {
      expect(error.message.startsWith(`password must be at least 6 characters`)).toBe(true);
    }
  });

  it('should sign up correctly', async () => {
    const variables = { input: { email: 'newUser@example.com', username: 'newUser', password: 'newUser' } };
    const { SignUp } = await testEnvironment.graphQLClient.request(signUpMutation, variables);
    const { user, token } = SignUp;
    expect(user.username).toBe('newUser');
    expect(user.email).toBe('newUser@example.com');
    expect(user.role).toBe(Role.USER);
    expect(token.length).toBeGreaterThan(20);
  });

  it('should not sign up with a already used email', async () => {
    const variables = { input: { email: 'testUser@example.com', username: 'newUser', password: 'newUser' } };
    try {
      const res = await testEnvironment.graphQLClient.request(signUpMutation, variables);
      expect(false).toBe(true); // fail the test if no error is thrown
    } catch (error) {
      expect(error.message.startsWith(`email 'testUser@example.com' already in use`)).toBe(true);
    }
  });

  it('should not sign up with wrong email input', async () => {
    let variables = { input: { email: '', username: 'newUser', password: 'newUser' } };
    try {
      const res = await testEnvironment.graphQLClient.request(signUpMutation, variables);
      expect(false).toBe(true); // fail the test if no error is thrown
    } catch (error) {
      expect(error.message.startsWith(`email is a required field`)).toBe(true);
    }
    variables = { input: { email: 'testUser@example', username: 'newUser', password: 'newUser' } };
    try {
      const res = await testEnvironment.graphQLClient.request(signUpMutation, variables);
      expect(false).toBe(true); // fail the test if no error is thrown
    } catch (error) {
      expect(error.message.startsWith(`email must be a valid email`)).toBe(true);
    }
  });

  it('should not sign up with wrong username input', async () => {
    let variables = { input: { email: 'testUser@example.com', username: '', password: 'newUser' } };
    try {
      const res = await testEnvironment.graphQLClient.request(signUpMutation, variables);
      expect(false).toBe(true); // fail the test if no error is thrown
    } catch (error) {
      expect(error.message.startsWith(`username is a required field`)).toBe(true);
    }
    variables = { input: { email: 'testUser@example.com', username: 'te', password: 'newUser' } };
    try {
      const res = await testEnvironment.graphQLClient.request(signUpMutation, variables);
      expect(false).toBe(true); // fail the test if no error is thrown
    } catch (error) {
      expect(error.message.startsWith(`username must be at least 3 characters`)).toBe(true);
    }
  });

  it('should not sign up with wrong password input', async () => {
    let variables = { input: { email: 'testUser@example.com', username: 'newUser', password: '' } };
    try {
      const res = await testEnvironment.graphQLClient.request(signUpMutation, variables);
      expect(false).toBe(true); // fail the test if no error is thrown
    } catch (error) {
      expect(error.message.startsWith(`password is a required field`)).toBe(true);
    }
    variables = { input: { email: 'testUser@example.com', username: 'newUser', password: 'newUs' } };
    try {
      const res = await testEnvironment.graphQLClient.request(signUpMutation, variables);
      expect(false).toBe(true); // fail the test if no error is thrown
    } catch (error) {
      expect(error.message.startsWith(`password must be at least 6 characters`)).toBe(true);
    }
  });

  it('should sign out correctly', async () => {
    testEnvironment.graphQLClient.setHeader('authorization', dbData.userToken);
    const { SignOut } = await testEnvironment.graphQLClient.request(signOutMutation);
    expect(SignOut).toBe(true);
  });

  it('should self recognise with Me query', async () => {
    testEnvironment.graphQLClient.setHeader('authorization', dbData.userToken);
    const { Me } = await testEnvironment.graphQLClient.request(meQuery);
    const { user, token } = Me;
    expect(user.id).toBe(dbData.users[0].id);
    expect(user.username).toBe(dbData.users[0].username);
    expect(user.email).toBe(dbData.users[0].email);
    expect(user.role).toBe(dbData.users[0].role);
    expect(token).toBe(dbData.userToken);
  });
});
