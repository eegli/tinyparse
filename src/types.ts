export type OptionsObject<K> = {
  name: K;
  required?: boolean;
  description?: string;
  shortFlag?: `-${string}`;
  isFilePath?: boolean;
};

export type Options<K> = OptionsObject<K extends string ? K : never>[];

export type ObjectValues = string | number | boolean;
