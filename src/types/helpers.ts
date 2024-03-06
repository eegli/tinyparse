import { CommandBuilder } from '../commands';
import { AnyGlobal, GenericHandler, RemoveNever } from '../types/internals';

export type CommandHandler<T, A extends string[] = string[]> =
  T extends CommandBuilder<infer O, infer G> ? GenericHandler<O, G, A> : never;

export type { ErrorHandler } from './internals';

export type GlobalSetter<T> =
  T extends CommandBuilder<infer O, unknown>
    ? (options: O) => AnyGlobal
    : never;

export type HandlerGlobals<T> =
  T extends CommandBuilder<unknown, infer G> ? G : never;

export type HandlerOptions<T> =
  T extends CommandBuilder<infer O, unknown> ? O : never;

export type HandlerParams<
  Options = never,
  Args = never,
  Globals = never,
  Usage = never,
> = RemoveNever<{
  options: Options;
  args: Args;
  globals: Globals;
  usage: Usage;
}>;
