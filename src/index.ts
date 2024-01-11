import { transform } from './argv';
import { collect } from './flags';
import {
  Subcommand,
  Downcast,
  FlagMap,
  FlagRecord,
  FlagOptions,
  InputFlagValue,
  CommandMap,
} from './types';

export { ValidationError } from './error';

export class ParserBuilder<F extends FlagRecord = Record<never, never>> {
  #flags: FlagMap = new Map();
  #commands: CommandMap<F> = new Map();

  public subcommand<P extends string[] | string>(
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
    return this as ParserBuilder<F & Record<T, Downcast<V>>>;
  }

  public default<T extends F>(
    handler: T extends FlagRecord
      ? (flags: T, positionals: string[]) => void
      : never,
  ) {
    return new Dispatcher<F>(this.#flags, this.#commands, handler);
  }
}

class Dispatcher<F extends FlagRecord = Record<never, never>> {
  constructor(
    private readonly flags: FlagMap,
    private readonly commands: CommandMap<F>,
    private readonly handler: (
      flags: FlagRecord,
      positionals: string[],
    ) => void,
  ) {}

  parse(argv: string[]): void {
    const [flagMap, positionals] = transform(argv);
    const flags = collect(this.flags, flagMap);

    const command = positionals[0];
    const subcommand = this.commands.get(command);
    if (!command || !subcommand) {
      return this.handler?.(flags, positionals);
    }

    return subcommand.handler(flags as F, positionals.slice(1));
  }
}
