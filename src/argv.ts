import { Parser } from './parser';
import { PositionalArgs, PrimitiveRecord, WithPositionalArgs } from './types';
import Utils from './utils';

export class ArgvParser<T extends PrimitiveRecord> extends Parser<T> {
  public build(input: T, positionals: string[]): WithPositionalArgs<T> {
    return {
      ...input,
      _: positionals,
    };
  }
  public transform(
    argv: string[]
  ): [Map<string, string | boolean>, PositionalArgs] {
    const flagMap = new Map<string, string | boolean>();

    const positionals: string[] = [];
    let isPositional = true;

    for (let i = 0; i < argv.length; i++) {
      const curr = argv[i];

      // A short flag is also a long flag
      const [isShortFlag] = Utils.getFlagType(curr);

      if (!isShortFlag && isPositional) {
        positionals.push(curr);
        // Collect positionals
        continue;
      }

      isPositional = false;

      if (!isShortFlag) continue;

      const flagVal = argv[i + 1];

      // Assume boolean flag
      if (!flagVal || flagVal.startsWith('-')) {
        flagMap.set(curr, true);
        // Assume string or number
      } else {
        flagMap.set(curr, flagVal);
      }
    }

    return [flagMap, positionals];
  }
}
