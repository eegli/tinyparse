import { InternalOptions, ParsingOptions, SimpleRecord } from './types';
import { parseJSONFile } from './utils';

export function transformOptions(
  parsingOptions?: ParsingOptions
): InternalOptions {
  if (!parsingOptions?.options) return [];
  return Object.entries(parsingOptions.options).map(([name, rest]) => ({
    name,
    ...rest,
  }));
}

type TransFormArgV = {
  argv: string[];
  options: InternalOptions;
  filePathFlag?: `--${string}`;
};

export function transformArgv<T extends SimpleRecord>({
  argv,
  options,
  filePathFlag,
}: TransFormArgV): Partial<T> {
  const shortFlags = options.reduce((acc, curr) => {
    if (curr.shortFlag) acc[curr.shortFlag] = curr.name;
    return acc;
  }, {} as SimpleRecord);

  const map = argv.reduce((acc, curr, idx, orig) => {
    if (
      curr.startsWith('-') &&
      Object.prototype.hasOwnProperty.call(shortFlags, curr)
    ) {
      curr = '--' + shortFlags[curr];
    }
    if (curr.startsWith('--')) {
      const arg = curr.slice(2);
      const argVal = orig[idx + 1];

      // Parse a file
      if (filePathFlag?.slice(2) === arg) {
        parseJSONFile(argVal).forEach(([key, content]) =>
          acc.set(key, content)
        );
      }
      // Assume boolean flag
      else if (!argVal || argVal.startsWith('--')) {
        acc.set(arg, true);
        // Assume number
      } else if (/^\d+$/.test(argVal)) {
        acc.set(arg, +argVal);
        // Assume string
      } else {
        acc.set(arg, argVal);
      }
    }
    return acc;
  }, new Map<string, unknown>());

  return Object.fromEntries(map) as Partial<T>;
}
