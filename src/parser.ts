import { transformArgv } from './argv';
import { ValidationError } from './error';
import { collect } from './options';
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

  parse(argv: string[]): {
    options: O;
    call: () => void;
  } {
    const [flagMap, positionals] = transformArgv(argv);

    const options = collect(flagMap, this.#options) as O;

    const [subcommand, ...subcommandArgs] = positionals;
    const subcommandOpts = this.#commands.get(subcommand);

    let handler = this.#defaultHandler.bind(this, {
      options,
      globals: this.#globals,
      args: positionals,
    });

    if (subcommandOpts) {
      this.#validateSubcommandArgs(subcommand, subcommandArgs, subcommandOpts);

      handler = subcommandOpts.handler.bind(this, {
        options,
        globals: this.#globals,
        args: subcommandArgs,
      });
    }

    return {
      options,
      call: handler,
    };
  }
}
