import { displayHelp } from './help';
import { parseObjectLiteral } from './parse';
import { transformArgv, transformOptions } from './transform';
import { ParsingOptions, SimpleRecord } from './types';

export { ValidationError } from './error';

/**
 * Parser factory function. Returns a parser that is bound to the
 * given default values and options per key.
 *
 * @export
 */
export function createParser<T extends SimpleRecord>(
  defaultValues: T,
  parsingOptions?: ParsingOptions<T>
) {
  const options = transformOptions(parsingOptions);
  const filePathArg = parsingOptions?.filePathArg;

  let positionalArgs: string[] = [];
  function parse(input: Partial<T> | string[] = []): Promise<T> {
    if (Array.isArray(input)) {
      [input, positionalArgs] = transformArgv({
        argv: input,
        filePathFlag: filePathArg?.longFlag,
        options,
      });
    }
    return parseObjectLiteral({
      defaultValues,
      input,
      options,
    });
  }

  return {
    help: function (title?: string): string {
      return displayHelp({ defaultValues, options, title, filePathArg });
    },
    parse,
    positionalArgs: function (): string[] {
      return positionalArgs;
    },
  };
}
