import { ParserBuilder } from './parser';
import {
  CommandArgPattern,
  CommandOptionMap,
  Downcast,
  FlagArgValue,
  FlagOptionMap,
  FlagOptions,
  FlagRecord,
  Subcommand,
} from './types';

export class CommandBuilder<F extends FlagRecord = Record<never, never>> {
  #flags: FlagOptionMap = new Map();
  #commands: CommandOptionMap<F> = new Map();

  #assertFlagIsValid = (flag: string): void => {
    if (this.#flags.has(flag)) {
      throw new Error(`Flag ${flag} already exists`);
    }
  };

  #assertCommandIsValid = (command: string): void => {
    if (this.#commands.has(command)) {
      throw new Error(`Command ${command} already exists`);
    }
  };

  subcommand<P extends CommandArgPattern>(
    command: string,
    opts: Subcommand<F, P>,
  ) {
    this.#assertCommandIsValid(command);
    this.#commands.set(command, opts);
    return this;
  }

  flag<T extends string, V extends FlagArgValue>(
    flag: T,
    opts: FlagOptions<V>,
  ) {
    this.#assertFlagIsValid(flag);
    this.#flags.set(flag, opts);
    // TODO: Figure out how to make this typecheck properly
    return this as unknown as CommandBuilder<F & Record<T, Downcast<V>>>;
  }

  build() {
    return new ParserBuilder<F>(this.#flags, this.#commands);
  }
}

export const validateCommandArgs = <
  F extends FlagRecord,
  P extends CommandArgPattern,
>(
  command: string,
  commandOpts: Subcommand<F, P>,
  args: string[],
) => {
  if (Array.isArray(commandOpts.args)) {
    const expectedNumArgs = commandOpts.args.length;
    const actualNumArgs = args.length;

    if (expectedNumArgs !== actualNumArgs) {
      const wording = expectedNumArgs === 1 ? 'argument' : 'arguments';
      throw new Error(
        `${command} expects ${expectedNumArgs} ${wording}, got ${actualNumArgs}`,
      );
    }
  }
};
