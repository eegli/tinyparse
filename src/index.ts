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

  function internalParse(input: Partial<T> | string[]): T {
    if (Array.isArray(input)) {
      const [transformed, positionals] = parser.transform(
        input,
        options.filePathArg
      );
      const parsed = parser.parse(transformed, options, true);
      return parser.build(parsed, positionals);
    }
    return parser.parse(input, options, false);
  }

  function parseSync(input?: Partial<T>): T;
  function parseSync(input?: string[]): WithPositionalArgs<T>;
  function parseSync(input: Partial<T> | string[] = {}): T {
    return internalParse(input);
  }

  async function parse(input?: Partial<T>): Promise<T>;
  async function parse(input?: string[]): Promise<WithPositionalArgs<T>>;
  // eslint-disable-next-line require-await
  async function parse(input: Partial<T> | string[] = {}): Promise<T> {
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
