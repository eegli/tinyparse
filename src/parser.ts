import { transformArgv } from './argv';
import { ValidationError } from './error';
import { collect } from './flags';
import {
  AnyGlobal,
  CommandArgPattern,
  CommandOptionMap,
  DefaultHandler,
  FlagOptionMap,
  FlagOptionRecord,
  Subcommand,
} from './types';

export class Parser<O extends FlagOptionRecord, G extends AnyGlobal> {
  #options: FlagOptionMap;
  #commands: CommandOptionMap<O, G>;
  #globals: G;
  #defaultHandler: DefaultHandler<O, G>;

  constructor(
    options: FlagOptionMap,
    commands: CommandOptionMap<O, G>,
    globals: G = {} as G,
    defaultHandler: DefaultHandler<O, G> = () => {},
  ) {
    this.#options = options;
    this.#commands = commands;
    this.#globals = globals;
    this.#defaultHandler = defaultHandler;
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

  parse<T extends string[]>(
    argv: T,
    handleError?: (error: ValidationError, args: T) => void,
  ): {
    call: () => void;
  } {
    const [flagMap, positionals] = transformArgv(argv);
    const call = () => {
      try {
        const options = collect(flagMap, this.#options) as O;

        const [subcommand, ...subcommandArgs] = positionals;
        const subcommandOpts = this.#commands.get(subcommand);

        if (subcommandOpts) {
          this.#validateSubcommandArgs(
            subcommand,
            subcommandArgs,
            subcommandOpts,
          );

          return subcommandOpts.handler({
            options,
            globals: this.#globals,
            args: subcommandArgs,
          });
        }
        return this.#defaultHandler({
          options,
          globals: this.#globals,
          args: positionals,
        });
      } catch (error) {
        if (error instanceof ValidationError && handleError) {
          return handleError(error, positionals as T);
        }
        throw error;
      }
    };
    return { call };
  }
}
