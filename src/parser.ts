import { transformArgv } from './argv';
import { ValidationError } from './error';
import { collectFlags } from './flags';
import { HelpPrinter } from './help';
import { CommandConfig, ParserConfig } from './options';
import {
  AnyGlobal,
  CommandArgPattern,
  ErrorHandler,
  FlagValueRecord,
  Subcommand,
} from './types';

export class Parser<O extends FlagValueRecord, G extends AnyGlobal> {
  #config: ParserConfig<O, G>;

  constructor(commandOptions: CommandConfig<O, G>) {
    this.#config = {
      ...commandOptions,
      // TODO move this outside
      helpPrinter: new HelpPrinter(
        [...commandOptions.options.values()],
        commandOptions.commands,
      ),
    };
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
    const [subcommand, ...subcommandArgs] = positionals;

    const helpText = this.#config.helpPrinter.print();

    const call = () => {
      for (const identifier of this.#config.helpIdentifiers) {
        if (flagMap.has(identifier) || subcommand === identifier) {
          console.log(helpText);
          return;
        }
      }
      try {
        const options = collectFlags(flagMap, this.#config.options) as O;

        const subcommandOpts = this.#config.commands.get(subcommand);

        const globals = this.#config.globalSetter(options) as G;

        if (subcommandOpts) {
          this.#validateSubcommandArgs(
            subcommand,
            subcommandArgs,
            subcommandOpts,
          );

          subcommandOpts.handler({
            options,
            globals,
            args: subcommandArgs,
          });
        } else {
          this.#config.defaultHandler({
            options,
            globals,
            args: positionals,
          });
        }
      } catch (error) {
        if (error instanceof ValidationError && handleError) {
          return handleError(error, positionals, helpText);
        }
        throw error;
      }
    };
    return { call };
  }
}
