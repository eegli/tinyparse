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
      let curr = argv[i];

      if (!curr.startsWith('-') && isPositional) {
        positionals.push(curr);
        continue;
      }

      isPositional = false;

      // Convert short flag to long flag
      if (aliases.has(curr)) {
        curr = '--' + aliases.get(curr);
      }

      // Ignore non-flags
      if (!curr.startsWith('--')) {
        continue;
      }

      let flag = curr.slice(2);
      if (aliases.has(flag)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        flag = aliases.get(flag)!;
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
