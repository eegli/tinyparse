import { Parser } from './parser';
import {
  FilePathArg,
  PositionalArgs,
  PrimitiveRecord,
  WithPositionalArgs,
} from './types';
import Utils from './utils';

export class ArgvParser<T extends PrimitiveRecord> extends Parser<T> {
  public build(input: T, positionals: string[]): WithPositionalArgs<T> {
    return {
      ...input,
      _: positionals,
    };
  }
  public transform(
    argv: string[],
    filePathArg?: FilePathArg
  ): [Partial<T>, PositionalArgs] {
    const flagMap = new Map<string, unknown>();

    const positionals: string[] = [];
    let isPositional = true;

    for (let i = 0; i < argv.length; i++) {
      const curr = argv[i];

      // A short flag is also a long flag
      const [isShortFlag, isLongFlag] = Utils.getFlagType(curr);

      if (!isShortFlag && isPositional) {
        positionals.push(curr);
        // Collect positionals
        continue;
      }

      isPositional = false;

      let flag = curr;

      if (isLongFlag) {
        flag = curr.slice(2);
        // Ignore non-flags
      } else if (isShortFlag) {
        flag = curr.slice(1);
      } else {
        continue;
      }

      const flagVal = argv[i + 1];

      // Parse a file
      const maybeFilePath = isLongFlag
        ? filePathArg?.longFlag
        : filePathArg?.shortFlag;

      if (maybeFilePath === flag) {
        Utils.parseJSONFile(flagVal).forEach(([key, content]) =>
          flagMap.set(key, content)
        );
      }
      // Assume boolean flag
      else if (!flagVal || flagVal.startsWith('-')) {
        flagMap.set(flag, true);
        // Assume string or number
      } else {
        flagMap.set(flag, flagVal);
      }
    }

    return [Object.fromEntries(flagMap) as Partial<T>, positionals];
  }
}
