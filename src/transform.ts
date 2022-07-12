import { FilePath, InternalOptions, Options, SimpleRecord } from './types';
import { parseJSONFile } from './utils';

export function transformOptions(options?: Options<string>): InternalOptions {
  if (!options?.options) return [];
  return Object.entries(options.options).map(([name, rest]) => ({
    name,
    ...rest,
  }));
}

export function transformArgv<T extends SimpleRecord>(
  args: string[],
  options: InternalOptions,
  filePathFlag?: FilePath
): Partial<T> {
  const shortFlags = options.reduce((acc, curr) => {
    if (curr.shortFlag) acc[curr.shortFlag] = curr.name;
    return acc;
  }, {} as SimpleRecord);

  const map = args.reduce((acc, curr, idx, orig) => {
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
      if (filePathFlag === curr) {
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
