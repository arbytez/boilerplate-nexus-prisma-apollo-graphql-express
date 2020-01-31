import { Role } from '@prisma/client';
import { mutationType, extendType, stringArg, queryType, inputObjectType, arg } from 'nexus';

import { ErrorCode } from '../enums';
import { setCookieInResponse, createApolloError, removeCookieInResponse, getTokenFromReq } from '../../helpers/utils';
import { hashPassword, generateToken, comparePassword } from '../../helpers/auth';

export const Query = extendType({
  type: 'Query',
  definition(t) {
    t.field('Me', {
      type: 'UserWithToken',
      async resolve(_root, _args, ctx, _info) {
        return { user: ctx?.user, token: getTokenFromReq(ctx?.req) };
      },
    });
  },
});

export const SignUpInput = inputObjectType({
  name: 'SignUpInput',
  nonNullDefaults: { input: true },
  definition(t) {
    t.string('email');
    t.string('username');
    t.string('password');
  },
});

export const SignInInput = inputObjectType({
  name: 'SignInInput',
  nonNullDefaults: { input: true },
  definition(t) {
    t.string('email');
    t.string('password');
  },
});

export const Mutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('SignUp', {
      type: 'UserWithToken',
      args: {
        input: arg({ type: 'SignUpInput', nullable: false }),
      },
      async resolve(_root, { input: { email, password, username } }, ctx, _info) {
        email = email.trim();
        username = username.trim();
        const existingUser = await ctx.prisma.user.findOne({ where: { email } });
        if (existingUser) {
          throw createApolloError(ErrorCode.EMAIL_ALREADY_IN_USE, [email]);
        }
        password = await hashPassword(password!);
        const user = await ctx.prisma.user.create({
          data: { email: email!, password, username: username!, role: Role.USER },
        });
        const token = generateToken(user);
        setCookieInResponse('token', token, ctx);
        return { user, token };
      },
    });

    t.field('SignIn', {
      type: 'UserWithToken',
      args: {
        input: arg({ type: 'SignInInput', nullable: false }),
      },
      async resolve(_root, { input: { email, password } }, ctx, _info) {
        email = email.trim();
        const user = await ctx.prisma.user.findOne({ where: { email } });
        if (!user) {
          throw createApolloError(ErrorCode.USER_NOT_FOUND, [email]);
        }
        await comparePassword(password, user.password);
        const token = generateToken(user);
        setCookieInResponse('token', token, ctx);
        return { user, token };
      },
    });

    t.field('SignOut', {
      type: 'Boolean',
      async resolve(_root, _args, ctx, _info) {
        removeCookieInResponse('token', ctx);
        return true;
      },
    });
  },
});
