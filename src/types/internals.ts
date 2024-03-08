import type { Parser } from '../parser';
import { ErrorParams } from './helpers';

export type LongFlag = `--${string}`;
export type ShortFlag = `-${string}`;

/**
 * The possible default values of a flag option.
 */
export type FlagValue = string | number | boolean | Date;

/**
 * The user settings for a flag option.
 */
export interface FlagOptions<V extends FlagValue, R extends boolean> {
  longFlag: LongFlag;
  shortFlag?: ShortFlag;
  defaultValue: DowncastFlag<V>;
  required?: R;
  description?: string;
  oneOf?: unknown[];
}

export interface FlagOptionsExt<
  V extends FlagValue,
  R extends boolean,
  T = unknown,
> extends FlagOptions<V, R> {
  oneOf: (V | T)[];
}

/**
 * A record of flags and their default values.
 */
export type FlagValueRecord = Record<string, FlagValue>;

/**
 * A map of flags and the settings specified by the user.
 */
export type FlagOptionsMap = Map<string, FlagOptions<FlagValue, boolean>>;

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

type AnyHandler<Options, Globals, Args> = (params: {
  options: Options;
  globals: Globals;
  args: Args;
}) => AnyHandlerReturn;

export type DefaultHandler<
  Options = FlagValueRecord,
  Globals = AnyGlobal,
> = AnyHandler<Options, Globals, string[]>;

export type ErrorHandler = ({ error, usage }: ErrorParams) => void;

/**
 * The settings for a subcommand.
 */
export type Subcommand<Options, Globals, Args> = {
  args: Args;
  description?: string;
  handler: Args extends string[]
    ? // Strict type annotation
      AnyHandler<Options, Globals, DowncastArgs<Args>>
    : // Loose type annotation
      AnyHandler<Options, Globals, string[]>;
};

/**
 * The settings for a subparser.
 */
export type Subparser = {
  description?: string;
  parser: Parser<unknown>;
};

/**
 * A map of subparsers and their settings.
 */
export type SubparserOptionsMap = Map<string, Subparser>;

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
