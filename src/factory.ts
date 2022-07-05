import { displayHelp } from './help';
import { parseObjectLiteral } from './parse';
import { transformArgv, transformOptions } from './transform';
import { Options, SimpleRecord } from './types';

export function createParser<T extends SimpleRecord>(
  defaultValues: T,
  options?: Options<T>
) {
  const argumentOptions = transformOptions(options);
  return {
    help: function (title?: string): string {
      return displayHelp(defaultValues, argumentOptions, title);
    },
    parse: function (args: Partial<T> | string[] = []): Promise<T> {
      if (Array.isArray(args)) {
        args = transformArgv(args, argumentOptions);
      }
      return parseObjectLiteral(defaultValues, args, argumentOptions);
    },
    transformArgv: transformArgv,
    parseLiteral: parseObjectLiteral,
  };
}
