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
  options?: Partial<Record<Extract<V, string>, OptionsObject>>;
};

export type InternalOptions = (OptionsObject & { name: string })[];

export type ObjectValues = string | number | boolean;
