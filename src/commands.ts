import { CommonConfig } from './config';
import { Parser } from './parser';
import {
  AnyGlobal,
  CommandArgPattern,
  DefaultHandler,
  Downcast,
  ErrorHandler,
  FlagOptionValue,
  FlagOptions,
  FlagValueRecord,
  MetaOptions,
  Subcommand,
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
    globalSetter: () => ({}) as Globals,
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

  option<K extends string, V extends FlagOptionValue>(
    key: K,
    opts: FlagOptions<V>,
  ) {
    const { longFlag, shortFlag } = opts;
    this.#validateOption(key);
    this.#config.options.set(key, opts);

    this.#tryRegisterFlagToken(longFlag);
    this.#tryRegisterFlagToken(shortFlag);

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
    this.#tryRegisterCommandToken(command);
    this.#config.commands.set(command, opts);
    return this;
  }

  subparser<O extends FlagValueRecord, G extends AnyGlobal>(
    command: string,
    parser: Parser<O, G>,
  ) {
    this.#tryRegisterCommandToken(command);
    this.#config.parsers.set(
      command,
      parser as Parser<FlagValueRecord, AnyGlobal>,
    );
    return this;
  }

  setGlobals<G extends Globals>(setGlobals: (options: Options) => G) {
    this.#config.globalSetter = setGlobals;
    return this as unknown as CommandBuilder<Options, G>;
  }

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

  onError(handler: ErrorHandler) {
    this.#config.errorHandler = handler;
    return this;
  }

  defaultHandler(handler?: DefaultHandler<Options, Globals>) {
    return new Parser<Options, Globals>({
      ...this.#config,
      defaultHandler: handler || this.#config.defaultHandler,
    });
  }
}
