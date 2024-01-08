import { ValidationError } from './error';
import { CommandOptions } from './types';
import Utils from './utils';

export class ArgvTransformer {
  public static transform(
    argv: string[],
  ): [Map<string, string | boolean>, string[]] {
    const flagMap = new Map<string, string | boolean>();

    const positionals: string[] = [];
    let isPositional = true;

    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];

      // A short flag is also a long flag
      const isShortFlag = Utils.isShortFlag(arg);

      if (!isShortFlag && isPositional) {
        positionals.push(arg);
        // Collect positionals
        continue;
      }

      isPositional = false;

      if (!isShortFlag) continue;

      const splitted = Utils.splitAtFirst(arg, '=');

      const [flag] = splitted;
      let [, flagVal] = splitted;

      if (!flagVal) flagVal = argv[i + 1];

      // Assume boolean flag
      if (!flagVal || Utils.isShortFlag(flagVal)) {
        flagMap.set(flag, true);
        // Assume string or number
      } else {
        flagMap.set(flag, flagVal);
      }
    }

    return [flagMap, positionals];
  }

  public static validateCommands(
    positionals: string[],
    commandOptions: CommandOptions,
  ): void {
    const availableCommands = Object.keys(commandOptions);

    // No commands are specified in the config
    if (availableCommands.length === 0) return;

    const [command, ...args] = positionals;

    // User did not specify a command
    if (!command || !commandOptions[command]) return;

    const { args: expectedPattern } = commandOptions[command];

    // Allow any number of command arguments
    if (typeof expectedPattern === 'string') return;

    // Number of arguments is satisfied
    if (expectedPattern.length === args.length) return;

    const tooFewArgs = expectedPattern.length > args.length;

    if (tooFewArgs) {
      throw new ValidationError(
        `Invalid usage of command '${command}'. Too few arguments`,
      );
    }
    throw new ValidationError(
      `Invalid usage of command '${command}'. Too many arguments`,
    );
  }
}
