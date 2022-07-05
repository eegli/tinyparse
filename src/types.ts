export type OptionsObject = {
  required?: boolean;
  description?: string;
  shortFlag?: `-${string}`;
  isFilePath?: boolean;
};

export type Options<
  K,
  V = K extends Record<string, unknown> ? keyof K : K extends string ? K : never
> = {
  options?: {
    [K in Extract<V, string>]?: OptionsObject;
  };
};

export type InternalOptions = (OptionsObject & { name: string })[];

export type SimpleRecord<T extends string = string> = Record<T, ObjectValues>;

export type ObjectValues = string | number | boolean;
