import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role } from '@prisma/photon';

import { Context } from '../server/context';
import { ErrorCode } from '../server/enums';
import { createApolloError } from './utils';
import photon from '../server/photon';

export type DecodedToken =
  | {
      userId: string;
      iat: number;
      exp: number;
    }
  | null
  | undefined;

export const validateToken = (token: string) => {
  let decodedToken: DecodedToken = undefined;
  try {
    decodedToken = jwt.verify(token, String(process.env.JWT_SECRET)) as DecodedToken;
  } catch (error) {}
  return decodedToken;
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
