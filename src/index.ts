import { ArgvTransformer } from './argv';
import { HelpPrinter } from './help';
import { Options } from './options';
import { Parser } from './parser';
import {
  HelpOptions,
  ParserOptions,
  FlagObject,
  WithPositionalArgs,
  CommandOptions,
  CommandPatternMap,
} from './types';

export { ValidationError } from './error';
export type { FlagValue } from './types';
export type { ParserOptions };

/**
 * Parser factory function. Returns a parser that is bound to the
 * given default values and options per key.
 *
 * @export
 */
export function createParser<
  F extends FlagObject,
  C extends CommandOptions = CommandOptions,
>(defaultValues: F, opts?: ParserOptions<F, C>) {
  const options = new Options(defaultValues, opts);
  const parser = new Parser<F>(options.flagOptions);
  const helpPrinter = new HelpPrinter(options.flagOptions)
    .withCommands(opts?.subcommands || {})
    .withFilePathFlags(...options.filePathFlags)
    .withFilePathDescription(options.filePathFlagDesc);

  const commandOptions = opts?.subcommands || {};

  function parseSync(
    input: string[] = [],
  ): WithPositionalArgs<F, CommandPatternMap<C>> {
    const [transformed, positionals] = ArgvTransformer.transform(input);
    ArgvTransformer.validateCommands(positionals, commandOptions);
    return parser
      .withArgvInput(transformed, options.aliases)
      .withFileInput(...options.filePathFlags)
      .parse()
      .collectWithPositionals(positionals);
  }

  // eslint-disable-next-line require-await
  async function parse(
    input: string[] = [],
  ): Promise<WithPositionalArgs<F, CommandPatternMap<C>>> {
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
