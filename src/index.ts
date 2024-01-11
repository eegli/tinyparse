import { transformArgv } from './argv';
import { validateCommandArgs } from './command';
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

export { ValidationError } from './error';

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

class DispatchBuilder<F extends FlagRecord> {
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

  public parseFlags(argv: string[]) {
    const [flagMap] = transformArgv(argv);
    return collect(this.flags, flagMap) as F;
  }

  public parse(argv: string[]) {
    const [flagMap, positionals] = transformArgv(argv);
    const flags = collect(this.flags, flagMap) as F;

    const [command, ...args] = positionals;
    const commandOpts = this.commands.get(command);
    if (!command || !commandOpts) {
      return this.#handler?.(flags, positionals);
    }

    validateCommandArgs(command, commandOpts, args);

    return commandOpts.handler(flags, args);
  }
}
