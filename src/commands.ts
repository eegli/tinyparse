import { CommandConfig } from './options';
import { Parser } from './parser';
import {
  AnyGlobal,
  CommandArgPattern,
  DefaultHandler,
  Downcast,
  FlagOptionValue,
  FlagOptions,
  FlagValueRecord,
  Subcommand,
} from './types';

export class CommandBuilder<
  Options extends FlagValueRecord,
  Globals extends AnyGlobal,
> {
  #config: CommandConfig<Options, Globals> = {
    options: new Map(),
    commands: new Map(),
    helpIdentifiers: new Set(),
    globalSetter: () => ({}) as Globals,
    defaultHandler: () => {},
  };

  #takenFlags = new Map<string, string>();

  #validateCommand = (command: string): void => {
    if (this.#config.commands.has(command)) {
      throw new Error(`Command "${command}" has been declared twice`);
    }
  };

  #validateOption = (
    key: string,
    longFlag: string,
    shortFlag?: string,
  ): void => {
    if (this.#config.options.has(key)) {
      throw new Error(`Option "${key}" has been declared twice`);
    }

    const longFlagConflict = this.#takenFlags.get(longFlag);
    if (longFlagConflict) {
      throw new Error(
        `Long flag "${longFlag}" has been declared twice, initially by option "${longFlagConflict}"`,
      );
    }
    if (!shortFlag) return;
    const shortFlagConflict = this.#takenFlags.get(shortFlag);
    if (shortFlagConflict) {
      throw new Error(
        `Short flag "${shortFlag}" has been declared twice, initially by option "${shortFlagConflict}"`,
      );
    }
  };

  #validateHelpIdentifier = (identifier: string): void => {
    if (this.#config.commands.has(identifier)) {
      throw new Error(
        `Help identifier "${identifier}" has already been declared as a subcommand`,
      );
    }
    if (this.#takenFlags.has(identifier)) {
      throw new Error(
        `Help identifier "${identifier}" has already been declared as a flag`,
      );
    }
  };

  option<K extends string, V extends FlagOptionValue>(
    key: K,
    opts: FlagOptions<V>,
  ) {
    const { longFlag, shortFlag } = opts;
    this.#validateOption(key, longFlag, shortFlag);
    this.#config.options.set(key, opts);
    this.#takenFlags.set(longFlag, key);
    if (shortFlag) this.#takenFlags.set(shortFlag, key);

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
    this.#validateCommand(command);
    this.#config.commands.set(command, opts);
    return this;
  }

  setGlobals<G extends Globals>(setGlobals: (options: Options) => G) {
    this.#config.globalSetter = setGlobals;
    return this as unknown as CommandBuilder<Options, G>;
  }

  setHelp(...identifiers: string[]) {
    for (const identifier of identifiers) {
      this.#validateHelpIdentifier(identifier);
    }
    this.#config.helpIdentifiers = new Set(identifiers);
    return this;
  }

  defaultHandler(handler?: DefaultHandler<Options, Globals>) {
    return new Parser<Options, Globals>({
      ...this.#config,
      defaultHandler: handler || this.#config.defaultHandler,
    });
  }
}
