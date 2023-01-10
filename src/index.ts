import { ArgvParser } from './argv';
import { displayHelp } from './help';
import { Options } from './options';
import { ParserParams, SimpleRecord, WithPositionalArgs } from './types';

export { ValidationError } from './error';
export type { ParserParams, WithPositionalArgs };

/**
 * Parser factory function. Returns a parser that is bound to the
 * given default values and options per key.
 *
 * @export
 */
export function createParser<T extends SimpleRecord>(
  defaultValues: T,
  params?: ParserParams<T>
) {
  const options = new Options(Object.keys(defaultValues), params);
  const parser = new ArgvParser<T>(defaultValues);

  async function parse(input?: Partial<T>): Promise<T>;
  async function parse(input?: string[]): Promise<WithPositionalArgs<T>>;
  async function parse(input: Partial<T> | string[] = {}): Promise<T> {
    if (Array.isArray(input)) {
      const [transformed, positionals] = parser.transform(input, {
        aliases: options.aliases,
        filePathFlag: options.filePathFlag?.longFlag,
      });
      const parsed = await parser.parse(transformed, options.options);
      return parser.build(parsed, positionals);
    }
    return parser.parse(input, options.options);
  }

  return {
    help: function (title?: string, baseCommand?: string): string {
      return displayHelp({
        defaultValues,
        options,
        title,
        baseCommand,
      });
    },
    parse,
  };
}
