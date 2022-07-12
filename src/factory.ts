import { displayHelp } from './help';
import { parseObjectLiteral } from './parse';
import { transformArgv, transformOptions } from './transform';
import { Options, SimpleRecord } from './types';

export function createParser<T extends SimpleRecord>(
  defaultValues: T,
  parserOptions?: Options<T>
) {
  const options = transformOptions(parserOptions);
  const filePathFlag = parserOptions?.filePathFlag;

  function parseProcessArgv(argv: string[]) {
    const input = transformArgv({
      argv,
      filePathFlag,
      options,
    });
    return parseObjectLiteral({
      defaultValues,
      input,
      options,
    });
  }

  return {
    help: function (title?: string): string {
      return displayHelp({ defaultValues, options, title });
    },
    parse: function (input: Partial<T> | string[] = []): Promise<T> {
      if (Array.isArray(input)) {
        return parseProcessArgv(input) as Promise<T>;
      }
      return parseObjectLiteral({
        defaultValues,
        input,
        options,
      });
    },
    parseArgv: parseProcessArgv,
    parseLiteral: parseObjectLiteral,
  };
}
