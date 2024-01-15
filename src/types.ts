import { Parser } from '.';

export type CustomValidator = {
  isValid: (value: unknown) => value is FlagOptionArgValue;
  errorMessage: (value: unknown, flag: string) => string;
};

export type FlagOptionArgValue = string | number | boolean | Date;
export type FlagInputMap = Map<string, string | null>;
export type FlagOption<V extends FlagOptionArgValue = FlagOptionArgValue> = {
  longFlag: `--${string}`;
  shortFlag?: `-${string}`;
  defaultValue: Downcast<V>;
  required?: boolean;
  description?: string;
};
export type FlagOptionMap = Map<string, FlagOption<FlagOptionArgValue>>;
export type FlagOptionRecord = Record<string, FlagOptionArgValue>;

export type CommandArgPattern = string[] | string;
export type CommandOptionMap<
  O extends FlagOptionRecord,
  G extends AnyGlobal,
> = Map<string, Subcommand<O, G, CommandArgPattern>>;

export type AnyGlobal = Record<string, unknown>;

export type HandlerParams<
  O = Record<string, FlagOptionArgValue>,
  G = AnyGlobal,
  A = string[],
> = {
  options: O;
  globals: G;
  args: A;
};

export type Handler<O, G, A> = (params: HandlerParams<O, G, A>) => void;

export type DefaultHandler<O, G> = Handler<O, G, string[]>;

export type Subcommand<O, G, A extends CommandArgPattern> = {
  args: A;
  description?: string;
  handler: A extends string[]
    ? Handler<O, G, Downcast<A>>
    : A extends string
      ? Handler<O, G, string[]>
      : `This is wrong!`;
};

export type SubcommandArgs<T, A extends string[] = string[]> = T extends Parser<
  infer O,
  infer G
>
  ? HandlerParams<O, G, A>
  : never;

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
