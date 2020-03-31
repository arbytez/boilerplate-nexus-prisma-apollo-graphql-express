import { ApolloError } from 'apollo-server-express';
import { shield, and, or, not, allow, deny } from 'graphql-shield';

import { ErrorCode } from '../../enums';
import { createApolloError } from '../../../helpers/utils';
import { isAdmin, isAuthenticated, isRoot, isTodoOwner, isUserOwner, rateLimitRule } from './rules';
import { checkFirstLastField } from './inputRules';
import {
  validateSignInInput,
  validateSignUpInput,
  validateUpdateTodoInput,
  validateCreateTodoInput,
  validateDeleteTodoInput,
  checkFirstField,
  checkLastField,
} from './inputRules';
import signale from '../../../logger';

const rateLimitRuleConfig =
  process.env.NODE_ENV === 'production' ? { window: '30s', max: 10 } : { window: '30s', max: 9999 };
const rateLimit = rateLimitRule(rateLimitRuleConfig);

export default shield(
  {
    Query: {
      '*': deny,
      todo: rateLimit,
      todos: and(rateLimit, and(or(checkFirstField, checkLastField), checkFirstLastField)),
      user: and(rateLimit, or(isAdmin, isRoot)),
      users: and(rateLimit, and(or(checkFirstField, checkLastField), checkFirstLastField), or(isAdmin, isRoot)),
      Me: rateLimit,
    },
    Mutation: {
      '*': deny,
      // auth
      SignUp: and(rateLimit, not(isAuthenticated), validateSignUpInput),
      SignIn: and(rateLimit, not(isAuthenticated), validateSignInInput),
      SignOut: and(rateLimit, isAuthenticated),
      // todo
      createTodo: and(rateLimit, isAuthenticated, validateCreateTodoInput),
      updateTodo: and(rateLimit, isAuthenticated, validateUpdateTodoInput, or(isTodoOwner, isAdmin, isRoot)),
      deleteTodo: and(rateLimit, isAuthenticated, validateDeleteTodoInput, or(isTodoOwner, isAdmin, isRoot)),
      createOneTodo: and(rateLimit, or(isAdmin, isRoot)),
      updateOneTodo: and(rateLimit, or(isAdmin, isRoot)),
      upsertOneTodo: and(rateLimit, or(isAdmin, isRoot)),
      deleteOneTodo: and(rateLimit, or(isAdmin, isRoot)),
      updateManyTodo: and(rateLimit, or(isAdmin, isRoot)),
      deleteManyTodo: and(rateLimit, or(isAdmin, isRoot)),
      // user
      createOneUser: and(rateLimit, or(isAdmin, isRoot)),
      updateOneUser: and(rateLimit, or(isAdmin, isRoot)),
      upsertOneUser: and(rateLimit, or(isAdmin, isRoot)),
      deleteOneUser: and(rateLimit, or(isAdmin, isRoot)),
      updateManyUser: and(rateLimit, or(isAdmin, isRoot)),
      deleteManyUser: and(rateLimit, or(isAdmin, isRoot)),
    },
    Subscription: {
      '*': deny,
      todoEvents: and(isAuthenticated),
    },
    User: {
      '*': deny,
      username: allow,
      todos: allow,
      id: or(isUserOwner, isAdmin, isRoot),
      createdAt: or(isUserOwner, isAdmin, isRoot),
      updatedAt: or(isUserOwner, isAdmin, isRoot),
      email: or(isUserOwner, isAdmin, isRoot),
      role: or(isUserOwner, isAdmin, isRoot),
    },
    Todo: {
      '*': deny,
      id: allow,
      createdAt: allow,
      updatedAt: allow,
      content: allow,
      done: allow,
      user: allow,
    },
  },
  {
    fallbackError: (err, parent, args, context, info) => {
      if (err instanceof ApolloError) {
        // expected errors
        return err;
      } else if (err instanceof Error) {
        // unexpected errors
        signale.error(err);
        return createApolloError(ErrorCode.INTERNAL_ERROR);
      } else {
        // what the hell got thrown
        signale.error('The resolver threw something that is not an error.');
        signale.error(err);
        return createApolloError(ErrorCode.INTERNAL_ERROR);
      }
    },
  }
);
