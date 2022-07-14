import { displayHelp } from './help';
import { parseObjectLiteral } from './parse';
import { transformArgv, transformOptions } from './transform';
import { ParsingOptions, SimpleRecord } from './types';

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

  return {
    help: function (title?: string): string {
      return displayHelp({ defaultValues, options, title, filePathArg });
    },
    parse: function (input: Partial<T> | string[] = []): Promise<T> {
      if (Array.isArray(input)) {
        input = transformArgv({
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
    },
  };
}
