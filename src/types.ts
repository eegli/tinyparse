export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> &
    Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

export type Options<T extends string> = RequireAtLeastOne<{
  required: RequiredOptions<T>[];
  shortFlags: {
    [P in `-${string}`]: T;
  };
}>;

export type RequiredOptions<T> = { argName: T; errorMessage: string };

export type StringOrNever<T> = T extends string ? T : never;

export type ObjectValues = string | number | boolean;
