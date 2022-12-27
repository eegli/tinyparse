interface BaseFlagOptions {
  required?: boolean;
  description?: string;
  shortFlag?: `-${string}`;
  skipParseInt?: boolean;
  customValidator?: {
    isValid: (value: unknown) => boolean;
    errorMessage: (value: unknown) => string;
  };
}

export type FilePathArg = {
  longFlag: `--${string}`;
  description?: string;
};

export type ParsingOptions<
  K = string,
  V = K extends Record<string, unknown> ? keyof K : K extends string ? K : never
> = {
  filePathArg?: FilePathArg;
  options?: {
    [K in Extract<V, string>]?: BaseFlagOptions;
  };
};

export type InternalOptions = Map<string, BaseFlagOptions & { name: string }>;

export type SimpleRecord<T extends string = string> = Record<T, Value>;

export type Value = string | number | boolean;
