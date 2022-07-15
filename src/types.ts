export type FlagOption = {
  required?: boolean;
  description?: string;
  shortFlag?: `-${string}`;
};

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
    [K in Extract<V, string>]?: FlagOption;
  };
};

export type InternalOptions = (FlagOption & { name: string })[];

export type SimpleRecord<T extends string = string> = Record<T, ObjectValues>;

export type ObjectValues = string | number | boolean;
