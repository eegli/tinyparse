import { ArgvParser } from './argv';
import { displayHelp } from './help';
import { Options } from './options';
import { Parser } from './parser';
import { ParserParams, SimpleRecord, WithPositionalArgs } from './types';

export { ValidationError } from './error';

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
  const options = new Options(
    params?.options,
    Object.keys(defaultValues),
    params?.global
  );

  async function parse(input?: Partial<T>): Promise<T>;
  async function parse(input?: string[]): Promise<WithPositionalArgs<T>>;
  async function parse(input: Partial<T> | string[] = {}): Promise<T> {
    if (Array.isArray(input)) {
      const parser = new ArgvParser<T>(defaultValues);
      const [transformed, positionals] = parser.transform(input, {
        aliases: options.aliases,
        shouldDecamelize: options.shouldDecamelize,
        filePathFlag: options.filePathFlag?.longFlag,
      });
      const parsed = await parser.parse(transformed, options.options);
      return parser.build(parsed, positionals);
    }
    return new Parser<T>(defaultValues).parse(input, options.options);
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
