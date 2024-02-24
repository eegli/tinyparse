import { transformArgv } from './argv';
import { CommonConfig } from './config';
import { ValidationError } from './error';
import { collectFlags } from './flags';
import { HelpPrinter } from './help';
import {
  AnyGlobal,
  CommandArgPattern,
  FlagValueRecord,
  Subcommand,
} from './types';

export class Parser<O extends FlagValueRecord, G extends AnyGlobal> {
  #config: CommonConfig<O, G>;
  #helpPrinter: HelpPrinter<O, G>;

  constructor(config: CommonConfig<O, G>) {
    this.#config = config;
    this.#helpPrinter = new HelpPrinter(config);
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

  parse(argv: string[]): {
    call: () => void;
  } {
    const [flagMap, positionals] = transformArgv(argv);
    const [subcommand, ...subcommandArgs] = positionals;

    const subparser = this.#config.parsers.get(subcommand);

    if (subparser) {
      return subparser.parser.parse(argv.slice(1));
    }

    const call = () => {
      const helpCommand = this.#config.meta.help?.command;
      const longHelpFlag = this.#config.meta.help?.longFlag;
      const shortHelpFlag = this.#config.meta.help?.shortFlag;
      if (
        (helpCommand && subcommand === helpCommand) ||
        (longHelpFlag && flagMap.has(longHelpFlag)) ||
        (shortHelpFlag && flagMap.has(shortHelpFlag))
      ) {
        console.log(this.#helpPrinter.print());
        return;
      }
      const versionCommand = this.#config.meta.version?.command;
      const longVersionFlag = this.#config.meta.version?.longFlag;
      const shortVersionFlag = this.#config.meta.version?.shortFlag;
      if (
        (versionCommand && subcommand === versionCommand) ||
        (longVersionFlag && flagMap.has(longVersionFlag)) ||
        (shortVersionFlag && flagMap.has(shortVersionFlag))
      ) {
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
        if (error instanceof ValidationError && this.#config.errorHandler) {
          const helpText = this.#helpPrinter.print();
          return this.#config.errorHandler(error, helpText);
        }
        throw error;
      }
    };
    return { call };
  }
}
