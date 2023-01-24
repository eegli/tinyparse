import { Options } from './options';

interface BaseArgOptions {
  required?: boolean;
  description?: string;
  shortFlag?: string;
  customValidator?: {
    isValid: (value: unknown) => boolean;
    errorMessage: (value: unknown) => string;
  };
}

interface InternalArgOptions extends BaseArgOptions {
  _type: string;
}

export type FilePathArg = {
  longFlag: string;
  shortFlag?: string;
  description?: string;
};

export type ArgOptions<
  O extends Record<string, unknown> = Record<string, BaseArgOptions>
> = {
  [K in Extract<keyof O, string>]?: BaseArgOptions;
};

export type ParserParams<T extends SimpleRecord = SimpleRecord> = {
  options?: ArgOptions<T>;
} & {
  decamelize?: boolean;
  filePathArg?: FilePathArg;
};
export type PositionalArgs = string[];

export type WithPositionalArgs<T> = T & { _: PositionalArgs };

export interface HelpOptions {
  title?: string;
  base?: string;
  decamelize?: boolean;
}

export interface InternalHelpOptions extends HelpOptions {
  options: Options;
}

export type InternalOptions = Map<string, InternalArgOptions>;

export type SimpleRecord = Record<string, Value>;

export type Value = string | number | boolean;
