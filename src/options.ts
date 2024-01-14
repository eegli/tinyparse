import { CommandBuilder } from './commands';
import {
  Downcast,
  FlagArgValue,
  FlagOptionMap,
  FlagOptions,
  FlagRecord,
} from './types';

export class OptionBuilder<F extends FlagRecord = Record<never, never>> {
  protected x = 1;
  #flags: FlagOptionMap = new Map();

  #assertFlagIsValid = (flag: string): void => {
    if (this.#flags.has(flag)) {
      throw new Error(`Flag ${flag} already exists`);
    }
  };

  flag<T extends string, V extends FlagArgValue>(
    flag: T,
    opts: FlagOptions<V>,
  ) {
    this.#assertFlagIsValid(flag);
    this.#flags.set(flag, opts);
    // TODO: Figure out how to make this typecheck properly
    return this as unknown as OptionBuilder<F & Record<T, Downcast<V>>>;
  }

  build() {
    return new CommandBuilder<F>(this.#flags);
  }
}
