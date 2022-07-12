import { displayHelp } from './help';
import { parseObjectLiteral } from './parse';
import { transformArgv, transformOptions } from './transform';
import { Options, SimpleRecord } from './types';

export function createParser<T extends SimpleRecord>(
  defaultValues: T,
  options?: Options<T>
) {
  const argumentOptions = transformOptions(options);
  const filePath = options?.filePath;

  function parseProcessArgv(argv: string[]) {
    const args = transformArgv(argv, argumentOptions, filePath);
    return parseObjectLiteral(defaultValues, args, argumentOptions);
  }

  return {
    help: function (title?: string): string {
      return displayHelp(defaultValues, argumentOptions, title);
    },
    parse: function (args: Partial<T> | string[] = []): Promise<T> {
      if (Array.isArray(args)) {
        return parseProcessArgv(args) as Promise<T>;
      }
      return parseObjectLiteral(defaultValues, args, argumentOptions);
    },
    parseArgv: parseProcessArgv,
    parseLiteral: parseObjectLiteral,
  };
}
