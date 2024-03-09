import { CommonConfig } from './config';
import { Parser } from './parser';
import {
  AnyGlobal,
  CommandArgPattern,
  DefaultHandler,
  DowncastFlag,
  ErrorHandler,
  FlagOptions,
  FlagOptionsExt,
  FlagValue,
  FlagValueRecord,
  MetaOptions,
  Subcommand,
  Subparser,
} from './types/internals';

export class CommandBuilder<Options, Globals> {
  #config: CommonConfig = {
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

  #validateOneOf = <T>(id: string, type: T, ...options: T[]): void => {
    const expectedType = typeof type;
    const wrongType = options.find((opt) => typeof opt !== expectedType);
    if (wrongType) {
      throw new Error(
        `OneOf for option "${id}" contains invalid type ${typeof wrongType}, expected ${expectedType}`,
      );
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
  option<
    K extends string,
    V extends FlagValue,
    R extends boolean,
    O extends unknown[],
    Choices = O[number],
    Values = R extends true ? Choices : V | Choices,
  >(
    key: K,
    opts: FlagOptionsExt<V, R, Choices>,
  ): CommandBuilder<Options & Record<K, Values>, Globals>;
  option<K extends string, V extends FlagValue, R extends boolean>(
    key: K,
    opts: FlagOptions<V, R>,
  ): CommandBuilder<Options & Record<K, DowncastFlag<V>>, Globals>;
  option<K extends string, V extends FlagValue, R extends boolean>(
    key: K,
    opts: FlagOptions<V, R>,
  ) {
    const { longFlag, shortFlag, oneOf, defaultValue } = opts;

    if (oneOf) {
      this.#validateOneOf(key, defaultValue, ...oneOf);
    }

    this.#validateOption(key);
    this.#config.options.set(key, opts);

    this.#tryRegisterFlagToken(longFlag);
    this.#tryRegisterFlagToken(shortFlag);

    return this as CommandBuilder<
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
    this.#config.commands.set(
      command,
      opts as Subcommand<FlagValueRecord, AnyGlobal, A>,
    );
    return this;
  }

  /**
   * Add a subparser
   */
  subparser(command: string, opts: Subparser) {
    this.#tryRegisterCommandToken(command);
    this.#config.parsers.set(command, opts);
    return this;
  }

  /**
   * Set the globals
   */
  setGlobals<G extends AnyGlobal>(
    setGlobals: (options: Options) => G | Promise<G>,
  ) {
    this.#config.globalSetter = setGlobals as (
      options: FlagValueRecord,
    ) => AnyGlobal | Promise<AnyGlobal>;
    return this as CommandBuilder<Options, Globals & G>;
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
    return new Parser<Options>({
      ...this.#config,
      defaultHandler:
        (handler as DefaultHandler) || this.#config.defaultHandler,
    });
  }
}
