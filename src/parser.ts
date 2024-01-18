import { transformArgv } from './argv';
import { ValidationError } from './error';
import { collectFlags } from './flags';
import { HelpPrinter } from './help';
import {
  AnyGlobal,
  CommandArgPattern,
  CommandOptionsMap,
  DefaultHandler,
  ErrorHandler,
  FlagOptionsMap,
  FlagValueRecord,
  Subcommand,
} from './types';

export class Parser<O extends FlagValueRecord, G extends AnyGlobal> {
  #options: FlagOptionsMap;
  #commands: CommandOptionsMap<O, G>;
  #globalSetter?: (options: O) => G;
  #defaultHandler: DefaultHandler<O, G>;
  #helpPrinter: HelpPrinter<O, G>;

  constructor(
    options: FlagOptionsMap,
    commands: CommandOptionsMap<O, G>,
    globalSetter?: (options: O) => G,
    defaultHandler: DefaultHandler<O, G> = () => {},
  ) {
    this.#options = options;
    this.#commands = commands;
    this.#globalSetter = globalSetter;
    this.#defaultHandler = defaultHandler;
    this.#helpPrinter = new HelpPrinter<O, G>(
      [...Object.values(options)],
      commands,
    );
  }

  #validateSubcommandArgs(
    command: string,
    args: string[],
    commandOpts: Subcommand<O, G, CommandArgPattern>,
  ) {
    if (Array.isArray(commandOpts.args)) {
      const expectedNumArgs = commandOpts.args.length;
      const actualNumArgs = args.length;

      if (expectedNumArgs !== actualNumArgs) {
        const wording = expectedNumArgs === 1 ? 'argument' : 'arguments';
        throw new ValidationError(
          `${command} expects ${expectedNumArgs} ${wording}, got ${actualNumArgs}`,
        );
      }
    }
  }

  parse(
    argv: string[],
    handleError?: ErrorHandler,
  ): {
    call: () => void;
  } {
    const [flagMap, positionals] = transformArgv(argv);
    const help = (title: string) => this.#helpPrinter.print(title);

    const call = () => {
      try {
        const options = collectFlags(flagMap, this.#options) as O;

        const [subcommand, ...subcommandArgs] = positionals;
        const subcommandOpts = this.#commands.get(subcommand);

        const globals = (this.#globalSetter?.(options) as G) || {};

        if (subcommandOpts) {
          this.#validateSubcommandArgs(
            subcommand,
            subcommandArgs,
            subcommandOpts,
          );

          return subcommandOpts.handler({
            options,
            globals,
            args: subcommandArgs,
          });
        }
        return this.#defaultHandler({
          options,
          globals,
          args: positionals,
        });
      } catch (error) {
        if (error instanceof ValidationError && handleError) {
          return handleError(error, positionals, help);
        }
        throw error;
      }
    };
    return { call };
  }
}
