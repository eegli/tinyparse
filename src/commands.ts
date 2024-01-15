import { Parser } from './parser';
import {
  AnyGlobal,
  CommandArgPattern,
  CommandOptionMap,
  DefaultHandler,
  Downcast,
  FlagOption,
  FlagOptionArgValue,
  FlagOptionMap,
  FlagOptionRecord,
  Subcommand,
} from './types';

export class CommandBuilder<O extends FlagOptionRecord, G extends AnyGlobal> {
  #flags: FlagOptionMap = new Map();
  #commands: CommandOptionMap<O, G> = new Map();
  #globals?: G;

  #assertCommandIsValid = (command: string): void => {
    if (this.#commands.has(command)) {
      throw new Error(`Command ${command} has been declared twice`);
    }
  };

  #assertOptionIsValid = (key: string): void => {
    if (this.#flags.has(key)) {
      throw new Error(`Option ${key} has been declared twice`);
    }
  };

  option<T extends string, V extends FlagOptionArgValue>(
    key: T,
    opts: FlagOption<V>,
  ) {
    this.#assertOptionIsValid(key);
    this.#flags.set(key, opts);
    // TODO: Figure out how to make this typecheck properly
    return this as unknown as CommandBuilder<O & Record<T, Downcast<V>>, G>;
  }

  subcommand<A extends CommandArgPattern>(
    command: string,
    opts: Subcommand<O, G, A>,
  ) {
    this.#assertCommandIsValid(command);
    this.#commands.set(command, opts);
    return this;
  }

  globals<T extends G>(globals: T) {
    this.#globals = globals;
    return this as unknown as CommandBuilder<O, T>;
  }

  defaultHandler(handler?: DefaultHandler<O, G>) {
    return new Parser<O, G>(
      this.#flags,
      this.#commands,
      this.#globals,
      handler,
    );
  }
}
