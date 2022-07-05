import { displayHelp } from './help';
import { parseProcessArgv } from './parse-argv';
import { parseObjectLiteral } from './parse-literal';
import { ObjectValues, Options } from './types';

export function createParser<T extends Record<string, ObjectValues>>(
  defaultValues: T,
  options: Options<keyof T> = []
) {
  return {
    parse: function (args: Partial<T> | string[] = []): Promise<T> {
      if (Array.isArray(args)) {
        args = parseProcessArgv(args, options);
      }
      return parseObjectLiteral(defaultValues, args, options);
    },
    parseArgv: parseProcessArgv,
    parseLiteral: parseObjectLiteral,
    help: function (title?: string) {
      return displayHelp(defaultValues, options || [], title);
    },
  };
}
