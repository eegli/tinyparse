type CustomValidator = {
  isValid: (value: unknown) => value is Value;
  errorMessage: (value: unknown, flag: string) => string;
};

// The parser requires a subset of options to work
export interface BaseFlagOptions {
  isRequired?: boolean;
  validator?: CustomValidator;
  value: Value;
}

// All options for a flag
export interface FlagOptions extends BaseFlagOptions {
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

export type PositionalOptionsValue = string[] | null;

export type PositionalOptions<P = PositionalOptionsValue[]> = {
  expect?: P;
  caseSensitive?: boolean;
  rejectAdditional?: boolean;
};

export type ParserOptions<
  T extends PrimitiveRecord = PrimitiveRecord,
  P extends PositionalOptionsValue[] = PositionalOptionsValue[],
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
  positionals?: PositionalOptions<P>;
  decamelize?: boolean;
  filePathArg?: FilePathArg;
};

export type WithPositionalArgs<T, P extends string[] = string[]> = T & { _: P };

export type PrimitiveRecord = Record<string, Value>;

export type Value = string | number | boolean;

export type TupleUnion<T> = {
  [K in keyof T]: InferLiteralUnion<T[K]>;
};

export type InferLiteralUnion<T> = T extends infer U
  ? U extends string[]
    ? U[number]
    : U extends null
      ? string
      : never
  : never;
