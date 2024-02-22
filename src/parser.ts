import { transformArgv } from './argv';
import { CommonConfig } from './config';
import { ValidationError } from './error';
import { collectFlags } from './flags';
import { HelpPrinter } from './help';
import {
  AnyGlobal,
  CommandArgPattern,
  ErrorHandler,
  FlagValueRecord,
  Subcommand,
} from './types';

export class Parser<O extends FlagValueRecord, G extends AnyGlobal> {
  #config: CommonConfig<O, G>;
  #helpPrinter: HelpPrinter<O, G>;
  constructor(config: CommonConfig<O, G>) {
    this.#config = config;
    this.#helpPrinter = new HelpPrinter(
      config.meta,
      [...config.options.values()],
      config.commands,
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
    const [subcommand, ...subcommandArgs] = positionals;

    const helpText = this.#helpPrinter.print();

    const helpCommand = this.#config.meta.help?.command;
    const versionCommand = this.#config.meta.version?.command;
    const longHelpFlag = this.#config.meta.help?.longFlag;
    const shortHelpFlag = this.#config.meta.help?.shortFlag;
    const longVersionFlag = this.#config.meta.version?.longFlag;
    const shortVersionFlag = this.#config.meta.version?.shortFlag;

    const call = () => {
      if (
        (helpCommand && subcommand === helpCommand) ||
        (longHelpFlag && flagMap.has(longHelpFlag)) ||
        (shortHelpFlag && flagMap.has(shortHelpFlag))
      ) {
        console.log(helpText);
        return;
      }

      if (
        (versionCommand && subcommand === versionCommand) ||
        (longVersionFlag && flagMap.has(longVersionFlag)) ||
        (shortVersionFlag && flagMap.has(shortVersionFlag))
      ) {
        // If this condition is true, the version is guaranteed to be defined
        console.log(this.#config.meta.version?.version);
        return;
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
          return handleError(error, helpText);
        }
        throw error;
      }
    };
    return { call };
  }
}
