import { ValidationError } from './error';
import { PositionalArgs, PositionalOptions } from './types';
import Utils from './utils';

export class ArgvTransformer {
  public static transform(
    argv: string[],
  ): [Map<string, string | boolean>, PositionalArgs] {
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

  public static validatePositionals(
    positionals: PositionalArgs,
    options: PositionalOptions,
  ): void {
    const {
      expect: expected = [],
      caseSensitive = false,
      rejectAdditional = false,
    } = options;

    if (expected.length > positionals.length) {
      throw new ValidationError(
        `Invalid number of positional arguments: Expected at least ${expected.length}, got ${positionals.length}`,
      );
    }

    if (rejectAdditional && expected.length < positionals.length) {
      throw new ValidationError(
        `Invalid number of positional arguments: Expected at most ${expected.length}, got ${positionals.length}`,
      );
    }

    for (let i = 0; i < expected.length; i++) {
      const expectedPosArgs = expected[i];
      // Allow any value
      if (expectedPosArgs === null) continue;
      const hasMatch = expectedPosArgs.some((expectedPosArg) => {
        if (caseSensitive) {
          return expectedPosArg === positionals[i];
        }
        return expectedPosArg.toLowerCase() === positionals[i].toLowerCase();
      });
      if (!hasMatch) {
        throw new ValidationError(
          `Invalid positional argument: Expected one of: ${expectedPosArgs
            .map((cmd) => `'${cmd}'`)
            .join(', ')}. Got '${positionals[i]}'`,
        );
      }
    }
  }
}
