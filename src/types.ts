type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T];

export type OnlyRequiredKeys<T> = Pick<T, RequiredKeys<T>>;

export type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

export type AliasMap = Map<string, string>;

export type FlagOptions = Map<string, FlagOption>;

type CustomValidator = {
  isValid: (value: unknown) => value is Value;
  errorMessage: (value: unknown, flag: string) => string;
};

export enum FlagType {
  LONG,
  SHORT,
}

export interface FlagOption {
  longFlag: string;
  shortFlag?: string;
  isRequired: boolean;
  description?: string;
  validator?: CustomValidator;
  value: Value;
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

interface UserKeyOptions {
  required?: boolean;
  description?: string;
  shortFlag?: string;
  longFlag?: string;
  customValidator?: CustomValidator;
}

type KeyOptions<
  O extends Record<string, unknown> = Record<string, UserKeyOptions>
> = {
  [K in Extract<keyof O, string>]?: UserKeyOptions;
};

export type ParserOptions<T extends PrimitiveRecord = PrimitiveRecord> = {
  options?: KeyOptions<T>;
} & {
  decamelize?: boolean;
  filePathArg?: FilePathArg;
};
export type PositionalArgs = string[];

export type WithPositionalArgs<T> = T & { _: PositionalArgs };

export type PrimitiveRecord = Record<string, Value>;

export type Value = string | number | boolean;
