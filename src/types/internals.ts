import { ValidationError } from '../error';
import type { Parser } from '../parser';

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
  defaultValue: DowncastFlag<V>;
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
export type CommandOptionsMap = Map<
  string,
  Subcommand<FlagValueRecord, AnyGlobal, CommandArgPattern>
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHandlerReturn = any | Promise<any>;

export type GenericHandler<Options, Globals, Args> = (params: {
  options: Options;
  globals: Globals;
  args: Args;
  usage: string;
}) => AnyHandlerReturn;

export type DefaultHandler<
  Options = FlagValueRecord,
  Globals = AnyGlobal,
> = GenericHandler<Options, Globals, string[]>;

export type GlobalSetter<Options = FlagValueRecord, Return = AnyGlobal> = (
  options: Options,
) => Return | Promise<Return>;

export type ErrorHandler = (error: ValidationError, usage: string) => void;

/**
 * The settings for a subcommand.
 */
export type Subcommand<Options, Globals, Args> = {
  args: Args;
  description?: string;
  handler: Args extends string[]
    ? // Strict type annotation
      GenericHandler<Options, Globals, DowncastArgs<Args>>
    : // Loose type annotation
      GenericHandler<Options, Globals, string[]>;
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
export type SubparserOptionsMap = Map<
  string,
  Subparser<FlagValueRecord, AnyGlobal>
>;

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

export type RemoveNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

export type DowncastArgs<T extends string[]> = {
  [P in keyof T]: string;
};

export type DowncastFlag<T extends FlagValue> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T;
