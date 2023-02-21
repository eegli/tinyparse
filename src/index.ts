import { ArgvParser } from './argv';
import { displayHelp } from './help';
import { Options } from './options';
import {
  HelpOptions,
  ParserOptions,
  PrimitiveRecord,
  WithPositionalArgs,
} from './types';

export { ValidationError } from './error';
export type { Value } from './types';
export type { ParserOptions };

/**
 * Parser factory function. Returns a parser that is bound to the
 * given default values and options per key.
 *
 * @export
 */
export function createParser<T extends PrimitiveRecord>(
  defaultValues: T,
  params?: ParserOptions<T>
) {
  const options = new Options(defaultValues, params);
  const parser = new ArgvParser<T>(defaultValues);

  function internalParse(input: string[]): WithPositionalArgs<T> {
    const [transformed, positionals] = parser.transform(input);
    const parsed = parser.parse(transformed, options);
    return parser.build(parsed, positionals);
  }

  function parseSync(input: string[] = []): WithPositionalArgs<T> {
    return internalParse(input);
  }

  // eslint-disable-next-line require-await
  async function parse(input: string[] = []): Promise<WithPositionalArgs<T>> {
    return internalParse(input);
  }

  return {
    help: function ({ title, base }: HelpOptions = {}): string {
      return displayHelp({
        options,
        base,
        title,
      });
    },
    parse,
    parseSync,
  };
}
