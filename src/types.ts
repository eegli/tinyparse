export interface BaseArgOptions {
  required?: boolean;
  description?: string;
  shortFlag?: `-${string}`;
  customValidator?: {
    isValid: (value: unknown) => boolean;
    errorMessage: (value: unknown) => string;
  };
}

export type FilePathFlag = {
  longFlag: `--${string}`;
  description?: string;
};

export type ArgOptions<
  O extends Record<string, unknown> = Record<string, BaseArgOptions>
> = {
  [K in Extract<keyof O, string>]?: BaseArgOptions;
};

export type ParserParams<T extends SimpleRecord = SimpleRecord> = {
  options?: ArgOptions<T>;
} & {
  decamelize?: boolean;
  filePathFlag?: FilePathFlag;
};
export type PositionalArgs = string[];

export type WithPositionalArgs<T> = T & { _: PositionalArgs };

export type InternalOptions = Map<string, BaseArgOptions>;

export type SimpleRecord = Record<string, Value>;

export type Value = string | number | boolean;
