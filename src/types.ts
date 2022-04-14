export type OptionsObject<K> = {
  name: K;
  required?: boolean;
  description?: string;
  shortFlag?: `-${string}`;
  allowNull?: boolean;
};

export type PartialNullable<T> = {
  [P in keyof T]?: T[P] | null;
};

export type Options<K = string> = OptionsObject<K extends string ? K : never>[];

export type ObjectValues = string | number | boolean | null;
