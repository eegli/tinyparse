import { Parser } from './parser';
import {
  AnyGlobal,
  CommandArgPattern,
  CommandOptionsMap,
  DefaultHandler,
  Downcast,
  FlagOptionValue,
  FlagOptions,
  FlagOptionsMap,
  FlagValueRecord,
  Subcommand,
} from './types';

export class CommandBuilder<
  Options extends FlagValueRecord,
  Globals extends AnyGlobal,
> {
  #flags: FlagOptionsMap = new Map();
  #commands: CommandOptionsMap<Options, Globals> = new Map();
  #globalSetter?: (options: Options) => Globals;

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

  option<K extends string, V extends FlagOptionValue>(
    key: K,
    opts: FlagOptions<V>,
  ) {
    this.#assertOptionIsValid(key);
    this.#flags.set(key, opts);
    // TODO: Figure out how to make this typecheck properly
    return this as unknown as CommandBuilder<
      Options & Record<K, Downcast<V>>,
      Globals
    >;
  }

  subcommand<A extends CommandArgPattern>(
    command: string,
    opts: Subcommand<Options, Globals, A>,
  ) {
    this.#assertCommandIsValid(command);
    this.#commands.set(command, opts);
    return this;
  }

  setGlobals<T extends Globals>(setGlobals: (options: Options) => T) {
    this.#globalSetter = setGlobals;
    return this as unknown as CommandBuilder<Options, T>;
  }

  defaultHandler(handler?: DefaultHandler<Options, Globals>) {
    return new Parser<Options, Globals>(
      this.#flags,
      this.#commands,
      this.#globalSetter,
      handler,
    );
  }
}
