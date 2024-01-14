import { transformArgv } from './argv';
import { collect } from './flags';
import {
  CommandArgPattern,
  CommandOptionMap,
  DefaultHandler,
  FlagOptionMap,
  FlagRecord,
  Subcommand,
} from './types';

export class Parser<F extends FlagRecord> {
  #flags: FlagOptionMap;
  #commands: CommandOptionMap<F>;
  #defaultHandler?: DefaultHandler<F>;

  constructor(
    flags: FlagOptionMap,
    commands: CommandOptionMap<F>,
    defaultHandler?: DefaultHandler<F>,
  ) {
    this.#flags = flags;
    this.#commands = commands;
    this.#defaultHandler = defaultHandler;
  }

  #validateSubcommandArgs(
    command: string,
    args: string[],
    commandOpts: Subcommand<F, CommandArgPattern>,
  ) {
    if (Array.isArray(commandOpts.args)) {
      const expectedNumArgs = commandOpts.args.length;
      const actualNumArgs = args.length;

      if (expectedNumArgs !== actualNumArgs) {
        const wording = expectedNumArgs === 1 ? 'argument' : 'arguments';
        throw new Error(
          `${command} expects ${expectedNumArgs} ${wording}, got ${actualNumArgs}`,
        );
      }
    }
  }

  parse(argv: string[]): {
    flags: F;
    call: () => void;
  } {
    const [flagMap, positionals] = transformArgv(argv);
    const flags = collect(flagMap, this.#flags) as F;

    const [subcommand, ...subcommandArgs] = positionals;
    const subcommandOpts = this.#commands.get(subcommand);

    let handler = () => {};

    if (subcommandOpts) {
      this.#validateSubcommandArgs(subcommand, subcommandArgs, subcommandOpts);
      handler = subcommandOpts.handler.bind(this, flags, subcommandArgs);
    } else if (this.#defaultHandler) {
      handler = this.#defaultHandler.bind(this, flags, positionals);
    }

    return {
      flags,
      call: handler,
    };
  }
}
