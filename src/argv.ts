import { PositionalArgs } from './types';
import Utils from './utils';

export class ArgvTransformer {
  public static transform(
    argv: string[]
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
}
