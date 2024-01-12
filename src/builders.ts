import { transformArgv } from './argv';
import { validateCommandArgs } from './commands';
import { collect } from './flags';
import {
  Subcommand,
  Downcast,
  FlagMap,
  FlagRecord,
  FlagOptions,
  InputFlagValue,
  CommandMap,
  CommandArgPattern,
} from './types';

export class CommandBuilder<F extends FlagRecord = Record<never, never>> {
  #flags: FlagMap = new Map();
  #commands: CommandMap<F> = new Map();

  public subcommand<P extends CommandArgPattern>(
    command: string,
    opts: Subcommand<F, P>,
  ) {
    this.#commands.set(command, opts);
    return this;
  }

  public flag<T extends string, V extends InputFlagValue>(
    flag: T,
    opts: FlagOptions<V>,
  ) {
    this.#flags.set(flag, opts);
    return this as unknown as CommandBuilder<F & Record<T, Downcast<V>>>;
  }

  public build() {
    return new DispatchBuilder<F>(this.#flags, this.#commands);
  }
}

export class DispatchBuilder<F extends FlagRecord> {
  #handler?: (flags: F, positionals: string[]) => void;

  constructor(
    private readonly flags: FlagMap,
    private readonly commands: CommandMap<F>,
  ) {}

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
    const flags = collect(this.flags, flagMap) as F;

    const [command, ...args] = positionals;
    const commandOpts = this.commands.get(command);

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
