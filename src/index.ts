import { ArgvParser } from './argv';
import { displayHelp } from './help';
import { Options } from './options';
import {
  HelpOptions,
  ParserOptions,
  SimpleRecord,
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
export function createParser<T extends SimpleRecord>(
  defaultValues: T,
  params?: ParserOptions<T>
) {
  const options = new Options(defaultValues, params);
  const parser = new ArgvParser<T>(defaultValues);

  async function parse(input?: Partial<T>): Promise<T>;
  async function parse(input?: string[]): Promise<WithPositionalArgs<T>>;
  async function parse(input: Partial<T> | string[] = {}): Promise<T> {
    if (Array.isArray(input)) {
      const [transformed, positionals] = parser.transform(input, {
        aliases: options.aliases,
        filePathFlag: options.filePathFlag?.longFlag,
      });
      const parsed = await parser.parse(transformed, options, true);
      return parser.build(parsed, positionals);
    }
    return parser.parse(input, options, false);
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
  };
}
