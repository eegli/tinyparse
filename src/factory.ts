import { displayHelp } from './help';
import { parseProcessArgv } from './parse-argv';
import { parseObjectLiteral } from './parse-literal';
import { InternalOptions, ObjectValues, Options } from './types';

export function transformOptions(options?: Options<string>): InternalOptions {
  if (!options?.options) return [];
  return Object.entries(options.options).map(([name, rest]) => ({
    name,
    ...rest,
  }));
}

export function createParser<T extends Record<string, ObjectValues>>(
  defaultValues: T,
  options?: Options<T>
) {
  const argumentOptions = transformOptions(options);
  return {
    help: function (title?: string) {
      return displayHelp(defaultValues, argumentOptions, title);
    },
    parse: function (args: Partial<T> | string[] = []): Promise<T> {
      if (Array.isArray(args)) {
        args = parseProcessArgv(args, argumentOptions);
      }
      return parseObjectLiteral(defaultValues, args, argumentOptions);
    },
    parseArgv: parseProcessArgv,
    parseLiteral: parseObjectLiteral,
  };
}
