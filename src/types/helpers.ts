import { CommandBuilder } from '../commands';
import { ValidationError } from '../error';

export type WithOptions<T> =
  T extends CommandBuilder<infer O, unknown>
    ? {
        options: O;
      }
    : never;

export type WithGlobals<T> =
  T extends CommandBuilder<unknown, infer G>
    ? {
        globals: G;
      }
    : never;

export type WithArgs<T extends string[]> = {
  args: T;
};

export type ErrorParams = {
  error: ValidationError;
  usage: string;
};

export type InferOptions<T> =
  T extends CommandBuilder<infer O, unknown> ? O : never;
