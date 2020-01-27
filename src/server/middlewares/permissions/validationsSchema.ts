// this file will contain all the yup object schema that must be used in the validation process (see middleware permissions)
// the responsibility to make a field required is forwarded to who call the validation
import * as yup from 'yup';
import { Role } from '@prisma/client';

export const usernameSchema = yup
  .string()
  .trim()
  .min(3)
  .max(50);

export const emailSchema = yup
  .string()
  .trim()
  .max(255)
  .email();

export const passwordSchema = yup
  .string()
  .min(6)
  .max(255);

export const roleSchema = yup
  .string()
  .matches(new RegExp(`(${Role.ROOT}|${Role.ADMIN}|${Role.USER})`, 'gi'))
  .required();

export const todoContentSchema = yup
  .string()
  .trim()
  .max(1000);

export const firstFieldSchema = yup
  .number()
  .min(1)
  .max(50);

export const lastFieldSchema = yup
  .number()
  .min(1)
  .max(50);
