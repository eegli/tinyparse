interface BaseFlagOptions {
  required?: boolean;
  description?: string;
  shortFlag?: `-${string}`;
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
  decamelize?: boolean;
  filePathArg?: FilePathArg;
  options?: {
    [K in Extract<V, string>]?: BaseFlagOptions;
  };
};

export type PositionalArgs = string[];

export type WithPositionalArgs<T> = T & { _: PositionalArgs };

export type InternalOption = BaseFlagOptions & {
  name: string;
  decamelizedKey?: string;
};

export type InternalOptions = Map<string, InternalOption>;

export type SimpleRecord<T extends string = string> = Record<T, Value>;

export type Value = string | number | boolean;
