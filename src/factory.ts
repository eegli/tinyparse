import { displayHelp } from './help';
import { parseObjectLiteral } from './parsers';
import { parseProcessArgv } from './parsers/parseArgv';
import { ObjectValues, Options } from './types';

export function createParser<T extends Record<string, ObjectValues>>(
  defaultValues: T,
  options: Options<keyof T> = []
) {
  return {
    parse: function (args: Partial<T> | string[] = []): Promise<T> {
      if (Array.isArray(args)) {
        args = parseProcessArgv(options, args);
      }
      return parseObjectLiteral(defaultValues, options, args);
    },
    parseArgv: parseProcessArgv,
    parseLiteral: parseObjectLiteral,
    help: function (title?: string) {
      return displayHelp(defaultValues, options || [], title);
    },
  };
}
