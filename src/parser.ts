import { transformArgv } from './argv';
import { validateCommandArgs } from './commands';
import { collect } from './flags';
import { CommandOptionMap, FlagOptionMap, FlagRecord } from './types';

export class ParserBuilder<F extends FlagRecord> {
  #handler?: (flags: F, positionals: string[]) => void;
  #flags: FlagOptionMap;
  #commands: CommandOptionMap<F>;

  constructor(flags: FlagOptionMap, commands: CommandOptionMap<F>) {
    this.#flags = flags;
    this.#commands = commands;
  }

  default<T extends F>(
    handler: T extends FlagRecord
      ? (flags: T, positionals: string[]) => void
      : never,
  ) {
    this.#handler = handler;
    return this;
  }

  parse(argv: string[]): {
    flags: F;
    call: () => void;
  } {
    const [flagMap, positionals] = transformArgv(argv);
    const flags = collect(flagMap, this.#flags) as F;

    const [command, ...args] = positionals;
    const commandOpts = this.#commands.get(command);

    if (command && commandOpts) {
      validateCommandArgs(command, commandOpts, args);
      const call = commandOpts.handler.bind(this, flags, args);
      return {
        flags,
        call,
      };
    }
    if (this.#handler) {
      const call = this.#handler?.bind(this, flags, positionals);
      return {
        flags,
        call,
      };
    }
    return {
      flags,
      call: () => {},
    };
  }
}
