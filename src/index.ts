import { displayHelp } from './help';
import { parseObjectLiteral } from './parse';
import { transformArgv, transformOptions } from './transform';
import {
  ParsingOptions,
  PositionalArgs,
  SimpleRecord,
  WithPositionalArgs,
} from './types';

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

  function parse(input?: Partial<T>): Promise<T>;
  function parse(input?: string[]): Promise<WithPositionalArgs<T>>;
  function parse(input: Partial<T> | string[] = {}): Promise<T> {
    let positionalArgs: PositionalArgs | undefined;
    if (Array.isArray(input)) {
      [input, positionalArgs] = transformArgv<T>({
        argv: input,
        filePathFlag: filePathArg?.longFlag,
        options,
      });
    }
    return parseObjectLiteral({
      defaultValues,
      input,
      options,
      forwardArgs: positionalArgs && { _: positionalArgs },
    });
  }

  return {
    help: function (title?: string): string {
      return displayHelp({ defaultValues, options, title, filePathArg });
    },
    parse,
  };
}
