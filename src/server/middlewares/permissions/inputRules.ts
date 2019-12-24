import { inputRule } from 'graphql-shield';

import {
  emailSchema,
  passwordSchema,
  usernameSchema,
  todoContentSchema,
  firstFieldSchema,
  lastFieldSchema,
} from './validationsSchema';

export const validateSignUpInput = inputRule()(
  yup =>
    yup.object({
      input: yup.object().shape({
        email: emailSchema.required(),
        username: usernameSchema.required(),
        password: passwordSchema.required(),
      }),
    }),
  {
    abortEarly: false,
  }
);

export const validateSignInInput = inputRule()(
  yup =>
    yup.object({
      input: yup.object().shape({
        email: emailSchema.required(),
        password: passwordSchema.required(),
      }),
    }),
  {
    abortEarly: false,
  }
);

export const validateCreateTodoInput = inputRule()(
  yup =>
    yup.object({
      input: yup.object().shape({
        done: yup.bool().notRequired(),
        content: todoContentSchema.required(),
      }),
    }),
  {
    abortEarly: false,
  }
);

export const validateUpdateTodoInput = inputRule()(
  yup =>
    yup.object({
      input: yup.object().shape({
        id: yup
          .string()
          .max(50)
          .required(),
        done: yup.bool().notRequired(),
        content: todoContentSchema.notRequired(),
      }),
    }),
  {
    abortEarly: false,
  }
);

export const validateDeleteTodoInput = inputRule()(
  yup =>
    yup.object({
      input: yup.object().shape({
        id: yup
          .string()
          .max(50)
          .required(),
      }),
    }),
  {
    abortEarly: false,
  }
);

export const checkFirstField = inputRule()(
  yup =>
    yup.object({
      first: firstFieldSchema.required(),
    }),
  {
    abortEarly: false,
  }
);

export const checkLastField = inputRule()(
  yup =>
    yup.object({
      last: lastFieldSchema.required(),
    }),
  {
    abortEarly: false,
  }
);

export const checkFirstLastField = inputRule()(
  yup =>
    yup.object().shape({
      first: firstFieldSchema,
      last: lastFieldSchema,
    }),
  {
    abortEarly: false,
  }
);
