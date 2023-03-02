import { ArgvTransformer } from './argv';
import { HelpPrinter } from './help';
import { Options } from './options';
import { Parser } from './parser';
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

  const helpPrinter = new HelpPrinter(options.flagOptions)
    .withFilePathFlags(...options.filePathFlags)
    .withFilePathDescription(options.filePathFlagDesc);

  function parseSync(input: string[] = []): WithPositionalArgs<T> {
    const [transformed, positionals] = ArgvTransformer.transform(input);
    return new Parser<T>()
      .withArgvInput(transformed, options.aliases)
      .withFileInput(...options.filePathFlags)
      .validate(options.flagOptions)
      .collectWithPositionals(positionals);
  }

  // eslint-disable-next-line require-await
  async function parse(input: string[] = []): Promise<WithPositionalArgs<T>> {
    return parseSync(input);
  }

  function help({ title, base }: HelpOptions = {}): string {
    return helpPrinter.print(title, base);
  }

  return {
    help,
    parse,
    parseSync,
  };
}
