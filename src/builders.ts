import { transformArgv } from './argv';
import { validateCommandArgs } from './commands';
import { collect } from './flags';
import {
  Subcommand,
  Downcast,
  FlagOptionMap,
  FlagRecord,
  FlagOptions,
  FlagArgValue,
  CommandOptionMap,
  CommandArgPattern,
} from './types';

export class CommandBuilder<F extends FlagRecord = Record<never, never>> {
  #flags: FlagOptionMap = new Map();
  #commands: CommandOptionMap<F> = new Map();

  public subcommand<P extends CommandArgPattern>(
    command: string,
    opts: Subcommand<F, P>,
  ) {
    this.#commands.set(command, opts);
    return this;
  }

  public flag<T extends string, V extends FlagArgValue>(
    flag: T,
    opts: FlagOptions<V>,
  ) {
    this.#flags.set(flag, opts);
    // TODO: Figure out how to make this typecheck properly
    return this as unknown as CommandBuilder<F & Record<T, Downcast<V>>>;
  }

  public build() {
    return new DispatchBuilder<F>(this.#flags, this.#commands);
  }
}

export class DispatchBuilder<F extends FlagRecord> {
  #handler?: (flags: F, positionals: string[]) => void;
  #flags: FlagOptionMap;
  #commands: CommandOptionMap<F>;

  constructor(flags: FlagOptionMap, commands: CommandOptionMap<F>) {
    this.#flags = flags;
    this.#commands = commands;
  }

  public default<T extends F>(
    handler: T extends FlagRecord
      ? (flags: T, positionals: string[]) => void
      : never,
  ) {
    this.#handler = handler;
    return this;
  }

  public parse(argv: string[]): {
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
