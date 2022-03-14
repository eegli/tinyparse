export type OptionsObject<K> = {
  name: K;
  required?: boolean;
  description?: string;
  shortFlag?: `-${string}`;
};

export type Options<K extends string = string> = OptionsObject<K>[];

export type ObjectValues = string | number | boolean;

export type StringOrNever<T> = T extends string ? T : never;
