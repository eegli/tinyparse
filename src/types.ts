interface ArgOption {
  required?: boolean;
  description?: string;
  shortFlag?: string;
  customValidator?: {
    isValid: (value: unknown) => boolean;
    errorMessage: (value: unknown) => string;
  };
}

export interface InternalArgOption extends ArgOption {
  _type: string;
}

export type FilePathArg = {
  longFlag: string;
  shortFlag?: string;
  description?: string;
};

export type ArgOptions<
  O extends Record<string, unknown> = Record<string, ArgOption>
> = {
  [K in Extract<keyof O, string>]?: ArgOption;
};

export interface HelpOptions {
  title?: string;
  base?: string;
}

export type ParserOptions<T extends SimpleRecord = SimpleRecord> = {
  options?: ArgOptions<T>;
} & {
  decamelize?: boolean;
  filePathArg?: FilePathArg;
};
export type PositionalArgs = string[];

export type WithPositionalArgs<T> = T & { _: PositionalArgs };

export type InternalOptions = Map<string, InternalArgOption>;

export type SimpleRecord = Record<string, Value>;

export type Value = string | number | boolean;
