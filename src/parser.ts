import { FlagInputMap, transformArgv } from './argv';
import { CommonConfig } from './config';
import { ValidationError } from './error';
import { collectFlags } from './flags';
import { HelpPrinter } from './help';
import {
  AnyGlobal,
  CommandArgPattern,
  FlagValueRecord,
  Subcommand,
} from './types/internals';
export class Parser<Options> {
  #config: CommonConfig;
  #helpPrinter: HelpPrinter;

  constructor(config: CommonConfig) {
    this.#config = config;
    this.#helpPrinter = new HelpPrinter(config);
  }

  /**
   * Get the default options with their default values
   */
  get options(): Options {
    const entries = [...this.#config.options.entries()].map(([k, v]) => [
      k,
      v.defaultValue,
    ]);
    return Object.fromEntries(entries);
  }

  #validateSubcommandArgs(
    command: string,
    args: string[],
    commandOpts: Subcommand<FlagValueRecord, AnyGlobal, CommandArgPattern>,
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
  #maybeInvokeMetaCommand(
    flagMap: FlagInputMap,
    subcommand: string,
    usage: string,
  ) {
    const helpCommand = this.#config.meta.help?.command;
    const longHelpFlag = this.#config.meta.help?.longFlag;
    const shortHelpFlag = this.#config.meta.help?.shortFlag;
    if (
      (helpCommand && subcommand === helpCommand) ||
      (longHelpFlag && flagMap.has(longHelpFlag)) ||
      (shortHelpFlag && flagMap.has(shortHelpFlag))
    ) {
      console.log(usage);
      return true;
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
      return true;
    }
    return false;
  }
  #handleError(error: unknown, usage: string) {
    if (error instanceof ValidationError && this.#config.errorHandler) {
      return this.#config.errorHandler({ error, usage });
    }
    throw error;
  }

  /**
   * Parse the given argv and return a function to call the appropriate handler
   */
  parse(argv: string[]): {
    call: () => Promise<void>;
  } {
    const [flagMap, positionals] = transformArgv(argv);
    const [subcommand, ...subcommandArgs] = positionals;

    const subparser = this.#config.parsers.get(subcommand);
    if (subparser) {
      return subparser.parser.parse(argv.slice(1));
    }

    const usage = this.#helpPrinter.printUsage();

    const call = async () => {
      if (this.#maybeInvokeMetaCommand(flagMap, subcommand, usage)) {
        return;
      }
      try {
        const options = collectFlags(flagMap, this.#config.options);
        const setGlobals =
          this.#config.globalSetter || (() => Promise.resolve({}));

        const globals = await setGlobals(options);
        const subcommandOpts = this.#config.commands.get(subcommand);

        if (subcommandOpts) {
          this.#validateSubcommandArgs(
            subcommand,
            subcommandArgs,
            subcommandOpts,
          );
          return await subcommandOpts.handler({
            options,
            globals,
            args: subcommandArgs,
          });
        } else {
          return await this.#config.defaultHandler({
            options,
            globals,
            args: positionals,
          });
        }
      } catch (error) {
        this.#handleError(error, usage);
      }
    };

    return { call };
  }
}
