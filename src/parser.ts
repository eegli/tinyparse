import { isAsyncFunction } from 'node:util/types';
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
      return this.#config.errorHandler(error, usage);
    }
    throw error;
  }

  parse(argv: string[]): {
    call: () => void;
    callAsync: () => Promise<void>;
  } {
    const [flagMap, positionals] = transformArgv(argv);
    const [subcommand, ...subcommandArgs] = positionals;

    const subparser = this.#config.parsers.get(subcommand);
    if (subparser) {
      return subparser.parser.parse(argv.slice(1));
    }

    const usage = this.#helpPrinter.printUsage();

    const callAsync = async () => {
      if (this.#maybeInvokeMetaCommand(flagMap, subcommand, usage)) {
        return;
      }
      try {
        const options = collectFlags(flagMap, this.#config.options) as O;
        const setGlobals = this.#config.globalSetter || (() => ({}) as G);
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
            usage,
          });
        } else {
          return await this.#config.defaultHandler({
            options,
            globals,
            args: positionals,
            usage,
          });
        }
      } catch (error) {
        this.#handleError(error, usage);
      }
    };

    const call = () => {
      if (this.#maybeInvokeMetaCommand(flagMap, subcommand, usage)) {
        return;
      }
      try {
        const options = collectFlags(flagMap, this.#config.options) as O;
        const setGlobals = this.#config.globalSetter || (() => ({}) as G);
        if (isAsyncFunction(setGlobals)) {
          throw new Error('callAsync must be used with an async global setter');
        }
        const globals = setGlobals(options) as G;
        const subcommandOpts = this.#config.commands.get(subcommand);
        if (subcommandOpts) {
          this.#validateSubcommandArgs(
            subcommand,
            subcommandArgs,
            subcommandOpts,
          );
          if (isAsyncFunction(subcommandOpts.handler)) {
            throw new Error(
              'callAsync must be used with an async command handler',
            );
          }
          return subcommandOpts.handler({
            options,
            globals,
            args: subcommandArgs,
            usage,
          });
        }
        if (isAsyncFunction(this.#config.defaultHandler)) {
          throw new Error(
            'callAsync must be used with an async default handler',
          );
        }
        return this.#config.defaultHandler({
          options,
          globals,
          args: positionals,
          usage,
        });
      } catch (error) {
        this.#handleError(error, usage);
      }
    };
    return { call, callAsync };
  }
}
