export type CustomValidator = {
  isValid: (value: unknown) => value is FlagArgValue;
  errorMessage: (value: unknown, flag: string) => string;
};

export type FlagArgValue = string | number | boolean | Date;
export type FlagInputMap = Map<string, string | null>;
export type FlagOptions<V extends FlagArgValue> = {
  longFlag: `--${string}`;
  shortFlag?: `-${string}`;
  defaultValue: Downcast<V>;
  required?: boolean;
  description?: string;
};
export type FlagOptionMap = Map<string, FlagOptions<FlagArgValue>>;
export type FlagRecord = Record<string, FlagArgValue>;

export type CommandArgPattern = string[] | string;
export type CommandOptionMap<F extends FlagRecord = FlagRecord> = Map<
  string,
  Subcommand<F, CommandArgPattern>
>;

export type Subcommand<F extends FlagRecord, P extends CommandArgPattern> = {
  args: P;
  description?: string;
  handler: P extends string[]
    ? (flags: F, positionals: Downcast<P>) => void
    : P extends string
      ? (flags: F, positionals: string[]) => void
      : (flags: F) => void;
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
