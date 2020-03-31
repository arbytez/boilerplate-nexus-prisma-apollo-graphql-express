import { ApolloError } from 'apollo-server-express';
import { Request } from 'express-serve-static-core';

import { Context } from '../server/context';
import { ErrorCode } from '../server/enums';

export const wait = (msTime: number = 1000): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), msTime);
  });
};

export const formatDuration = (ms: number): string => {
  if (ms < 0) ms = -ms;
  const time = {
    day: Math.floor(ms / 86400000),
    hour: Math.floor(ms / 3600000) % 24,
    minute: Math.floor(ms / 60000) % 60,
    second: Math.floor(ms / 1000) % 60,
    millisecond: Math.floor(ms) % 1000,
  };
  return Object.entries(time)
    .filter(val => val[1] !== 0)
    .map(([key, val]) => `${val} ${key}${val !== 1 ? 's' : ''}`)
    .join(', ');
};

export const getTokenFromReq = (req: Request): string => {
  try {
    let token = req.headers['authorization'] || '';
    if (!token) token = getCookieFromReq(req, 'token') || '';
    return token;
  } catch (error) {
    return '';
  }
};

export const getCookieFromReq = (req: Request, cookieKey: string): string => {
  try {
    const cookie = req.cookies[cookieKey];
    const signedCookie = req.signedCookies[cookieKey];
    if (cookie) return cookie;
    if (signedCookie) return signedCookie;
    return '';
  } catch (error) {
    return '';
  }
};

export const setCookieInResponse = (cookieName: string, cookieValue: string, ctx: Context) => {
  ctx.res.cookie(cookieName, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    path: '/',
    maxAge: 1000 * Number(process.env.JWT_TOKEN_EXPIRES_SEC_IN) || 1000 * 60 * 60 * 24 * 7, // default 7 days
  });
};

export const removeCookieInResponse = (cookieName: string, ctx: Context) => {
  ctx.res.clearCookie(cookieName);
};

export const obfuscateIp = (ip: string | undefined): string => {
  if (!ip) return 'n/a';
  const ipParts = ip.split('.');
  if (ipParts.length === 4) {
    return `${ipParts[0]}.${ipParts[1]}.${ipParts[2].replace(/\d/g, 'x')}.${ipParts[3].replace(/\d/g, 'x')}`;
  } else {
    return 'n/a';
  }
};

export const createApolloError = (code: ErrorCode, ...args: any[]) => {
  switch (code) {
    case ErrorCode.INVALID_CREDENTIALS:
      return new ApolloError('invalid credentials', code);
    case ErrorCode.EMAIL_ALREADY_IN_USE:
      return new ApolloError(`email '${args[0]}' already in use`, code);
    case ErrorCode.USER_NOT_FOUND:
      return new ApolloError(`user '${args[0]}' not found`, code);
    case ErrorCode.RESOURCE_ID_NOT_FOUND:
      return new ApolloError(`resource id '${args[0]}' not found`, code);
    case ErrorCode.NOT_AUTHENTICATED:
      return new ApolloError('Not authenticated', code);
    case ErrorCode.NOT_AUTHORIZED:
      return new ApolloError('Not authorized', code);
    case ErrorCode.VALIDATION_FAILED:
      return new ApolloError('Validation failed', code, { validationErrors: args });
    case ErrorCode.INTERNAL_ERROR:
      return new ApolloError('Internal Error', code);
    default:
      return new ApolloError('Unknown error', ErrorCode.UNKNOWN);
  }
};
