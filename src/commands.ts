import { Parser } from './parser';
import {
  CommandArgPattern,
  CommandOptionMap,
  DefaultHandler,
  FlagOptionMap,
  FlagRecord,
  Subcommand,
} from './types';

export class CommandBuilder<F extends FlagRecord> {
  #flags: FlagOptionMap;

  #handler?: DefaultHandler<F>;
  #commands: CommandOptionMap<F> = new Map();

  constructor(flags: FlagOptionMap) {
    this.#flags = flags;
  }

  #assertCommandIsValid = (command: string): void => {
    if (this.#commands.has(command)) {
      throw new Error(`Command ${command} already exists`);
    }
  };

  defaultHandler<T extends F>(
    handler?: T extends FlagRecord
      ? (flags: T, positionals: string[]) => void
      : never,
  ) {
    this.#handler = handler;
    return new Parser<F>(this.#flags, this.#commands, this.#handler);
  }

  subcommand<P extends CommandArgPattern>(
    command: string,
    opts: Subcommand<F, P>,
  ) {
    this.#assertCommandIsValid(command);
    this.#commands.set(command, opts);
    return this;
  }
}
