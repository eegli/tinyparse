type _ = Record<never, never>;

// Flags do NOT start with a single or double dash
export type Flag = string & _;

// Flag aliases start with a single or double dash
export type FlagAlias = string & _;

export type FlagAliasMap = Map<FlagAlias, Flag>;

interface ArgOption {
  required?: boolean;
  description?: string;
  shortFlag?: Flag;
  customValidator?: {
    isValid: (value: unknown) => boolean;
    errorMessage: (value: unknown) => string;
  };
}

export interface InternalArgOption extends ArgOption {
  _type: string;
}

export type FilePathArg = {
  longFlag: Flag;
  shortFlag?: Flag;
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

export type InternalOptions = Map<Flag, InternalArgOption>;

export type SimpleRecord = Record<string, Value>;

export type Value = string | number | boolean;
