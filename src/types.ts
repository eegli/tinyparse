type CustomValidator = {
  isValid: (value: unknown) => value is Value;
  errorMessage: (value: unknown, flag: string) => string;
};

// The parser requires a subset of options to work
export interface BaseFlagOption {
  isRequired?: boolean;
  validator?: CustomValidator;
  value: Value;
}

// All options for a flag
export interface FlagOption extends BaseFlagOption {
  longFlag: string;
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
