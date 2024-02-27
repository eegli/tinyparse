import { CommandBuilder } from './commands';
import { ValidationError } from './error';
import type { Parser } from './parser';

export type LongFlag = `--${string}`;
export type ShortFlag = `-${string}`;

/**
 * The possible default values of a flag option.
 */
export type FlagValue = string | number | boolean | Date;

/**
 * The user settings for a flag option.
 */
export type FlagOptions<V extends FlagValue = FlagValue> = {
  longFlag: LongFlag;
  shortFlag?: ShortFlag;
  defaultValue: Downcast<V>;
  required?: boolean;
  description?: string;
};

/**
 * A record of flags and their default values.
 */
export type FlagValueRecord = Record<string, FlagValue>;

/**
 * A map of flags and the settings specified by the user.
 */
export type FlagOptionsMap = Map<string, FlagOptions>;

/**
 * Any global settings specified by the user.
 */
export type AnyGlobal = Record<string, unknown>;

/**
 * A pattern that describes the expected arguments of a command.
 */
export type CommandArgPattern = string[] | string | undefined;

/**
 * A map of subcommands and their settings.
 */
export type CommandOptionsMap<
  Options extends FlagValueRecord = FlagValueRecord,
  Globals extends AnyGlobal = AnyGlobal,
> = Map<string, Subcommand<Options, Globals, CommandArgPattern>>;

type GenericHandler<Options, Globals, Args> = (params: {
  options: Options;
  globals: Globals;
  args: Args;
  usage: string;
}) => void | Promise<void>;

/**
 * The settings for a subcommand.
 */
export type Subcommand<Options, Globals, Args> = {
  args: Args;
  description?: string;
  handler: Args extends string[]
    ? GenericHandler<Options, Globals, Downcast<Args>>
    : GenericHandler<Options, Globals, string[]>;
};

/**
 * The settings for a subparser.
 */
export type Subparser<O extends FlagValueRecord, G extends AnyGlobal> = {
  description?: string;
  parser: Parser<O, G>;
};

/**
 * A map of subparsers and their settings.
 */
export type SubparserOptionsMap<
  O extends FlagValueRecord = FlagValueRecord,
  G extends AnyGlobal = AnyGlobal,
> = Map<string, Subparser<O, G>>;

export type HelpOptions = {
  command?: string;
  longFlag: LongFlag;
  shortFlag?: ShortFlag;
};

export type VersionOptions = {
  version: string;
  command?: string;
  longFlag: LongFlag;
  shortFlag?: ShortFlag;
};
export interface MetaOptions {
  command?: string;
  summary?: string;
  help?: HelpOptions;
  version?: VersionOptions;
}

export type CommandHandler<
  T,
  A extends string[] = string[],
> = T extends CommandBuilder<infer O, infer G>
  ? GenericHandler<O, G, A>
  : never;

export type DefaultHandler<Options, Globals> = GenericHandler<
  Options,
  Globals,
  string[]
>;

export type GlobalSetter<T> = T extends CommandBuilder<infer O, AnyGlobal>
  ? (options: O) => AnyGlobal
  : never;

export type ErrorHandler = (error: ValidationError, usage: string) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HandlerOptions<T> = T extends CommandBuilder<infer O, any>
  ? O
  : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HandlerGlobals<T> = T extends CommandBuilder<any, infer G>
  ? G
  : never;

export type HandlerParams<
  Options extends FlagValueRecord = never,
  Args extends string[] = never,
  Globals extends AnyGlobal = never,
  Usage extends string = never,
> = (
  params: RemoveNever<{
    options: Options;
    args: Args;
    globals: Globals;
    usage: Usage;
  }>,
) => void | Promise<void>;

type RemoveNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

export type Downcast<T> = T extends unknown[]
  ? {
      [P in keyof T]: T[P] extends number
        ? number
        : T[P] extends string
          ? string
          : T[P] extends boolean
            ? boolean
            : T[P];
    }
  : T extends number
    ? number
    : T extends string
      ? string
      : T extends boolean
        ? boolean
        : T;
