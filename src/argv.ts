import { Parser } from './parser';
import { PositionalArgs, SimpleRecord, WithPositionalArgs } from './types';
import { parseJSONFile } from './utils';

type TransformArgs = {
  aliases: Map<string, string>;
  filePathFlag?: string;
};

export class ArgvParser<T extends SimpleRecord> extends Parser<T> {
  public build(input: T, positionals: string[]): WithPositionalArgs<T> {
    return {
      ...input,
      _: positionals,
    };
  }
  public transform(
    argv: string[],
    { aliases, filePathFlag }: TransformArgs
  ): [Partial<T>, PositionalArgs] {
    const flagMap = new Map<string, unknown>();

    const positionals: string[] = [];
    let isPositional = true;

    for (let i = 0; i < argv.length; i++) {
      const curr = argv[i];

      if (!curr.startsWith('-') && isPositional) {
        positionals.push(curr);
        continue;
      }

      isPositional = false;

      let flag = curr;

      // Lookup short flag or decamelized alias
      if (aliases.has(curr)) {
        // Now flag is the original key
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        flag = aliases.get(curr)!;
        // No alias, it's likely the original, just strip the prefix
      } else if (curr.startsWith('--')) {
        flag = curr.slice(2);
        // Ignore non-flags
      } else {
        continue;
      }

      const flagVal = argv[i + 1];

      // Parse a file
      if (filePathFlag?.slice(2) === flag) {
        parseJSONFile(flagVal).forEach(([key, content]) =>
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
