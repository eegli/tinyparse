import { CommonConfig } from './config';
import { Parser } from './parser';
import {
  AnyGlobal,
  CommandArgPattern,
  DefaultHandler,
  DowncastFlag,
  ErrorHandler,
  FlagOptions,
  FlagValue,
  FlagValueRecord,
  MetaOptions,
  Subcommand,
  Subparser,
} from './types';

export class CommandBuilder<
  Options extends FlagValueRecord,
  Globals extends AnyGlobal,
> {
  #config: CommonConfig<Options, Globals> = {
    meta: {},
    options: new Map(),
    commands: new Map(),
    parsers: new Map(),
    defaultHandler: () => {},
  };

  #takenFlags = new Set<string>();
  #takenCommands = new Set<string>();

  #validateCommand = (command: string): void => {
    if (this.#takenCommands.has(command)) {
      throw new Error(`Command "${command}" has been declared twice`);
    }
  };

  #validateFlag = (flag: string): void => {
    if (this.#takenFlags.has(flag)) {
      throw new Error(`Flag "${flag}" has been declared twice`);
    }
  };

  #validateOption = (key: string): void => {
    if (this.#config.options.has(key)) {
      throw new Error(`Option "${key}" has been declared twice`);
    }
  };

  #tryRegisterCommandToken = (command?: string) => {
    if (command) {
      this.#validateCommand(command);
      this.#takenCommands.add(command);
    }
  };

  #tryRegisterFlagToken = (flag?: string) => {
    if (flag) {
      this.#validateFlag(flag);
      this.#takenFlags.add(flag);
    }
  };

  /**
   * Add an option (flag)
   */
  option<K extends string, V extends FlagValue>(key: K, opts: FlagOptions<V>) {
    const { longFlag, shortFlag } = opts;
    this.#validateOption(key);
    this.#config.options.set(key, opts);

    this.#tryRegisterFlagToken(longFlag);
    this.#tryRegisterFlagToken(shortFlag);

    // TODO: Figure out how to make this typecheck properly
    return this as unknown as CommandBuilder<
      Options & Record<K, DowncastFlag<V>>,
      Globals
    >;
  }

  /**
   * Add a subcommand
   */
  subcommand<A extends CommandArgPattern>(
    command: string,
    opts: Subcommand<Options, Globals, A>,
  ) {
    this.#tryRegisterCommandToken(command);
    this.#config.commands.set(command, opts);
    return this;
  }

  /**
   * Add a subparser
   */
  subparser(command: string, opts: Subparser<FlagValueRecord, AnyGlobal>) {
    this.#tryRegisterCommandToken(command);
    this.#config.parsers.set(command, opts);
    return this;
  }

  /**
   * Set the globals
   */
  setGlobals<G extends Globals>(
    setGlobals: (options: Options) => G | Promise<G>,
  ) {
    this.#config.globalSetter = setGlobals;
    return this as unknown as CommandBuilder<Options, G>;
  }

  /**
   * Set metadata
   */
  setMeta(meta: MetaOptions) {
    this.#tryRegisterCommandToken(meta.help?.command);
    this.#tryRegisterCommandToken(meta.version?.command);

    this.#tryRegisterFlagToken(meta.help?.longFlag);
    this.#tryRegisterFlagToken(meta.help?.shortFlag);
    this.#tryRegisterFlagToken(meta.version?.longFlag);
    this.#tryRegisterFlagToken(meta.version?.shortFlag);

    this.#config.meta = meta;
    return this;
  }

  /**
   * Set the error handler
   */
  onError(handler: ErrorHandler) {
    this.#config.errorHandler = handler;
    return this;
  }

  /**
   * Set the default handler
   */
  defaultHandler(handler?: DefaultHandler<Options, Globals>) {
    return new Parser<Options, Globals>({
      ...this.#config,
      defaultHandler: handler || this.#config.defaultHandler,
    });
  }
}
