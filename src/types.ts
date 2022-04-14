export type OptionsObject<K> = {
  name: K;
  required?: boolean;
  description?: string;
  shortFlag?: `-${string}`;
};

export type Options<K = string> = OptionsObject<K extends string ? K : never>[];

export type ObjectValues = string | number | boolean;
