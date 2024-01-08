import { ArgvTransformer } from './argv';
import { HelpPrinter } from './help';
import { Options } from './options';
import { Parser } from './parser';
import {
  HelpOptions,
  ParserOptions,
  PrimitiveRecord,
  WithPositionalArgs,
  CommandOptions,
  CommandPatternMap,
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
export function createParser<
  T extends PrimitiveRecord,
  C extends CommandOptions = CommandOptions,
>(defaultValues: T, opts?: ParserOptions<T, C>) {
  const options = new Options(defaultValues, opts);
  const parser = new Parser<T>(options.flagOptions);
  const helpPrinter = new HelpPrinter(options.flagOptions)
    .withCommands(opts?.commands || {})
    .withFilePathFlags(...options.filePathFlags)
    .withFilePathDescription(options.filePathFlagDesc);

  const commandOptions = opts?.commands || {};

  function parseSync(
    input: string[] = [],
  ): WithPositionalArgs<T, CommandPatternMap<C>> {
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
  ): Promise<WithPositionalArgs<T, CommandPatternMap<C>>> {
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

/* const x = createParser(
  {},
  {
    positionals: {
      copy: {
        pattern: ['src', 'dst'],
        description: 'Copy files from src to dst',
      },
      cd: {
        pattern: ['directory'],
        description: 'List a single directory',
      },
      info: {
        pattern: [],
        description: 'Show info about the current directory',
      },
      rm: {
        pattern: 'files',
        description: 'Remove multiple files or directories',
      },
    } as const,
  },
).parseSync()._;

const [command, ...rest] = x;

switch (command) {
  case 'copy':
    const [, src, dst] = x;
    break;
  case 'cd':
    const [, directory] = x;
    break;
  case 'info':
    x;
    break;
  case 'rm':
    const [, first, second, ...rest] = x;
    break;
}
 */
