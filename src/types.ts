export type CustomValidator = {
  isValid: (value: unknown) => value is FlagValue;
  errorMessage: (value: unknown, flag: string) => string;
};

export interface HelpOptions {
  title?: string;
  base?: string;
}

export type InputFlagValue = string | number | false | Date;
export type FlagValue = string | number | boolean | Date;

export type FlagOptions<V extends FlagValue> = {
  longFlag: `--${string}`;
  shortFlag?: `-${string}`;
  defaultValue: Downcast<V>;
  required?: boolean;
  description?: string;
};

export type FlagMap = Map<string, FlagOptions<FlagValue>>;
export type CommandMap<F extends Record<string, FlagValue>> = Map<
  string,
  Subcommand<F, string[] | string>
>;

export type WithPositionalArgs<T> = T & {
  _: string[];
};

export type FlagRecord = Record<string, FlagValue>;

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

export type Subcommand<
  F extends Record<string, FlagValue>,
  P extends string[] | string,
> = {
  args?: P;
  description?: string;
  handler: P extends string[]
    ? (flags: F, positionals: Downcast<P>) => void
    : P extends string
      ? (flags: F, positionals: string[]) => void
      : never;
};
