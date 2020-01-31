import fs from 'fs';
import { join } from 'path';
import http from 'http';
import { v4 } from 'uuid';
import { GraphQLClient } from 'graphql-request';
import { PrismaClient, Role, User, Todo } from '@prisma/client';

import { hashPassword, generateToken } from '../../helpers/auth';
import { wait } from '../../helpers/utils';

export interface TestEnvironment {
  server: http.Server;
  prismaClient: PrismaClient;
  newDbPath: string;
  graphQLClient: GraphQLClient;
}

export interface DbData {
  users: User[];
  todos: Todo[];
  userToken: string;
  adminToken: string;
  rootToken: string;
}

export const createNewTestEnvironment = (): TestEnvironment => {
  // check if folder db/generated exists
  const generatedDbPath = join(__dirname, '..', 'db', 'generated');
  if (!fs.existsSync(generatedDbPath)) fs.mkdirSync(generatedDbPath);
  // get an unused port for the graphql server
  process.env.PORT = require('arbitrary-unused-port');
  // create the new db used for the test suite
  const originalDb = join(__dirname, '..', 'db', 'data.sqlite');
  if (!fs.existsSync(originalDb)) throw new Error(`Original db not found on '${originalDb}'`);
  const newDbName = v4();
  const newDbDestination = join(__dirname, '..', 'db', 'generated', `${newDbName}.sqlite`);
  fs.copyFileSync(originalDb, newDbDestination);
  process.env.SQLITE_URL = `file:${newDbDestination}`;
  // start server and get prismaClient instance
  const server = require('../../server/initServer');
  const prismaClient = require('../../server/prismaClient');
  return {
    server: server.default,
    prismaClient: prismaClient.default,
    newDbPath: newDbDestination,
    graphQLClient: new GraphQLClient(`http://localhost:${process.env.PORT}/graphql`),
  };
};

export const cleanTestEnvironment = async (testEnvironment: TestEnvironment) => {
  await testEnvironment.server.close();
  await testEnvironment.prismaClient.disconnect();
  await wait(2000); // sqlite file is locked, must wait a bit before unlink
  fs.unlinkSync(testEnvironment.newDbPath);
};

export const seedTestEnvironment = async (testEnvironment: TestEnvironment): Promise<DbData> => {
  // create 1 user for every role
  const testUserPassword = await hashPassword('testUser');
  const testUser = await testEnvironment.prismaClient.user.create({
    data: {
      email: 'testUser@example.com',
      password: testUserPassword,
      username: 'testUser',
      role: Role.USER,
    },
  });
  const userToken = generateToken(testUser);
  const adminUserPassword = await hashPassword('adminUser');
  const adminUser = await testEnvironment.prismaClient.user.create({
    data: {
      email: 'adminUser@example.com',
      password: adminUserPassword,
      username: 'adminUser',
      role: Role.ADMIN,
    },
  });
  const adminToken = generateToken(adminUser);
  const rootUserPassword = await hashPassword('rootUser');
  const rootUser = await testEnvironment.prismaClient.user.create({
    data: {
      email: 'rootUser@example.com',
      password: rootUserPassword,
      username: 'rootUser',
      role: Role.ROOT,
    },
  });
  const rootToken = generateToken(rootUser);
  // create 2 todos for every user
  await testEnvironment.prismaClient.todo.create({
    data: { content: 'testUser1', done: false, user: { connect: { id: testUser.id } } },
  });
  await testEnvironment.prismaClient.todo.create({
    data: { content: 'testUser2', done: true, user: { connect: { id: testUser.id } } },
  });
  await testEnvironment.prismaClient.todo.create({
    data: { content: 'adminUser1', done: false, user: { connect: { id: adminUser.id } } },
  });
  await testEnvironment.prismaClient.todo.create({
    data: { content: 'adminUser2', done: true, user: { connect: { id: adminUser.id } } },
  });
  await testEnvironment.prismaClient.todo.create({
    data: { content: 'rootUser1', done: false, user: { connect: { id: rootUser.id } } },
  });
  await testEnvironment.prismaClient.todo.create({
    data: { content: 'rootUser2', done: true, user: { connect: { id: rootUser.id } } },
  });
  return {
    todos: await testEnvironment.prismaClient.todo.findMany(),
    users: await testEnvironment.prismaClient.user.findMany(),
    userToken,
    adminToken,
    rootToken,
  };
};
