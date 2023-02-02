import { Parser } from './parser';
import {
  FilePathArg,
  FlagAliasMap,
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
    aliases: FlagAliasMap,
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
        continue;
      }

      isPositional = false;

      let flag = curr;

      // Lookup short flag or decamelized alias
      const originalFlag = aliases.get(curr);
      if (originalFlag) {
        // Now flag is the original key
        flag = originalFlag;
        // No alias, it's likely the original, just strip the prefix
      } else if (isLongFlag) {
        flag = curr.slice(2);
        // Ignore non-flags
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
        // Assume number
        // Assume string
      } else {
        flagMap.set(flag, flagVal);
      }
    }

    return [Object.fromEntries(flagMap) as Partial<T>, positionals];
  }
}
