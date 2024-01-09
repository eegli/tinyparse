type CustomValidator = {
  isValid: (value: unknown) => value is FlagValue;
  errorMessage: (value: unknown, flag: string) => string;
};

// The parser requires a subset of options to work
export interface BaseFlagOptions {
  isRequired?: boolean;
  validator?: CustomValidator;
  longFlag: string;
  value: FlagValue;
}

// All options for a flag
export interface FlagOptions extends BaseFlagOptions {
  shortFlag?: string;
  description?: string;
}

export type FilePathArg = {
  longFlag: string;
  shortFlag?: string;
  description?: string;
};

export interface HelpOptions {
  title?: string;
  base?: string;
}

export type CommandOptions = Record<
  string,
  {
    args: string | string[];
    description?: string;
  }
>;

export type ParserOptions<
  T extends FlagObject = FlagObject,
  C extends CommandOptions = CommandOptions,
> = {
  options?: {
    [K in keyof T]?: {
      required?: boolean;
      description?: string;
      shortFlag?: string;
      longFlag?: string;
      customValidator?: CustomValidator;
    };
  };
  subcommands?: C;
  requireSubcommand?: boolean;
  decamelize?: boolean;
  filePathArg?: FilePathArg;
};

export type WithPositionalArgs<T, P extends string[] = string[]> = T & {
  _: P;
};

export type FlagObject = Record<string, FlagValue>;

export type FlagValue = string | number | boolean;

export type CommandPatternMap<T extends CommandOptions> = {
  [K in keyof T]: K extends string ? CommandArgTypeMap<K, T[K]['args']> : never;
}[keyof T];

type CommandArgTypeMap<K extends string, V> = V extends string[]
  ? [K, ...Downcast<V, string>]
  : V extends string
    ? [K, ...string[]]
    : never;

type Downcast<T, E> = T extends E[] ? { [K in keyof T]: E } : E[];
