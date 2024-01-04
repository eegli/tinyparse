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

export type EqCountSymbol =
  | '=' // Exactly
  | '>=' // More than or equal
  | '<='; // Less than or equal

export type UniversalCountSymbol = '*';

export type CountExpression =
  | `${EqCountSymbol}${number}`
  | UniversalCountSymbol;

export type PositionalOptions = {
  count: CountExpression;
};

export type ParserOptions<T extends PrimitiveRecord = PrimitiveRecord> = {
  options?: {
    [K in keyof T]?: {
      required?: boolean;
      description?: string;
      shortFlag?: string;
      longFlag?: string;
      customValidator?: CustomValidator;
    };
  };
  positionals?: PositionalOptions;
  decamelize?: boolean;
  filePathArg?: FilePathArg;
};
export type PositionalArgs = string[];

export type WithPositionalArgs<T> = T & { _: PositionalArgs };

export type PrimitiveRecord = Record<string, Value>;

export type Value = string | number | boolean;
