type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T];

export type OnlyRequiredKeys<T> = Pick<T, RequiredKeys<T>>;

export type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

export enum FlagType {
  Short = 'SHORT',
  Long = 'LONG',
}

export type AliasConfig = {
  forKey: string;
  flagType: FlagType;
};

interface UserKeyOptions {
  required?: boolean;
  description?: string;
  shortFlag?: string;
  longFlag?: string;
  customValidator?: {
    isValid: (value: unknown) => value is Value;
    errorMessage: (value: unknown, flag: string) => string;
  };
}

export interface InternalKeyOptions extends UserKeyOptions {
  required: boolean;
  longFlag: string;
  _type: string;
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
