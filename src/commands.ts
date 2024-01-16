import { Parser } from './parser';
import {
  AnyGlobal,
  CommandArgPattern,
  CommandOptionsMap,
  DefaultHandler,
  Downcast,
  FlagDefaultValue,
  FlagOptions,
  FlagOptionsMap,
  FlagValueRecord,
  Subcommand,
} from './types';

export class CommandBuilder<O extends FlagValueRecord, G extends AnyGlobal> {
  #flags: FlagOptionsMap = new Map();
  #commands: CommandOptionsMap<O, G> = new Map();
  #globalSetter?: (options: O) => G;

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

  option<T extends string, V extends FlagDefaultValue>(
    key: T,
    opts: FlagOptions<V>,
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

  globals<T extends G>(setGlobals: (options: O) => T) {
    this.#globalSetter = setGlobals;
    return this as unknown as CommandBuilder<O, T>;
  }

  defaultHandler(handler?: DefaultHandler<O, G>) {
    return new Parser<O, G>(
      this.#flags,
      this.#commands,
      this.#globalSetter,
      handler,
    );
  }
}
