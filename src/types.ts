import { CommandBuilder } from './commands';
import { ValidationError } from './error';

export type CustomValidator = {
  isValid: (value: unknown) => value is FlagOptionValue;
  errorMessage: (value: unknown, flag: string) => string;
};

export type LongFlag = `--${string}`;
export type ShortFlag = `-${string}`;

/**
 * The possible default values of a flag option.
 */
export type FlagOptionValue = string | number | boolean | Date;

/**
 * The user settings for a flag option.
 */
export type FlagOptions<V extends FlagOptionValue = FlagOptionValue> = {
  longFlag: LongFlag;
  shortFlag?: ShortFlag;
  defaultValue: Downcast<V>;
  required?: boolean;
  description?: string;
};

/**
 * A record of flags and their default values.
 */
export type FlagValueRecord = Record<string, FlagOptionValue>;

/**
 * A map of flags and the settings specified by the user.
 */
export type FlagOptionsMap = Map<string, FlagOptions>;

export type AnyGlobal = Record<string, unknown>;

export type CommandArgPattern = string[] | string | undefined;

export type CommandOptionsMap<
  Options extends FlagValueRecord = FlagValueRecord,
  Globals extends AnyGlobal = AnyGlobal,
> = Map<string, Subcommand<Options, Globals, CommandArgPattern>>;

type GenericHandler<Options, Globals, Args> = (params: {
  options: Options;
  globals: Globals;
  args: Args;
}) => void;

export type Subcommand<Options, Globals, Args> = {
  args: Args;
  description?: string;
  handler: Args extends string[]
    ? GenericHandler<Options, Globals, Downcast<Args>>
    : GenericHandler<Options, Globals, string[]>;
};

export type GlobalSetter<T> = T extends CommandBuilder<infer O, AnyGlobal>
  ? (options: O) => AnyGlobal
  : never;

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
  appName?: string;
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

export type ErrorHandler = (error: ValidationError, helpText: string) => void;

export type DefaultHandler<Options, Globals> = GenericHandler<
  Options,
  Globals,
  string[]
>;

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
