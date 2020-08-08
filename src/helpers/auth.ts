import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role } from '@prisma/client';

import { Context } from '../server/context';
import { ErrorCode } from '../server/enums';
import { createApolloError } from './utils';
import prismaClient from '../server/prismaClient';
import signale from '../logger';

export type DecodedToken =
  | {
      userId: string;
      iat: number;
      exp: number;
    }
  | null
  | undefined;

export const validateToken = (token: string) => {
  let decodedToken: DecodedToken;
  try {
    decodedToken = jwt.verify(token, String(process.env.JWT_SECRET)) as DecodedToken;
  } catch (error) {}
  return decodedToken;
};

export const validateTokenAndGetUser = async (token: string): Promise<User | null> => {
  try {
    const decodedToken = validateToken(token);
    if (decodedToken) {
      const user = await prismaClient.user.findOne({ where: { id: decodedToken.userId } });
      return user;
    }
    return null;
  } catch (error) {
    signale.error(error);
    return null;
  }
};

export const generateToken = (user: User | { id: string | number }) => {
  // generate the JWT Token
  const expiresIn = Number(process.env.JWT_TOKEN_EXPIRES_SEC_IN) || 60 * 60 * 24 * 7; // default 7 days
  const token = jwt.sign({ userId: user.id }, String(process.env.JWT_SECRET), {
    expiresIn,
  });
  return token;
};

export const comparePassword = async (passwordToCheck: string, encryptedPassword: string) => {
  const valid = await bcrypt.compare(passwordToCheck, encryptedPassword);
  if (!valid) {
    throw createApolloError(ErrorCode.INVALID_CREDENTIALS);
  }
};

export const hashPassword = async (passwordToHash: string) => {
  const genSalt = await bcrypt.genSalt(12);
  return await bcrypt.hash(passwordToHash, genSalt);
};
