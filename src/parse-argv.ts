import { ObjectValues, Options } from './types';

export function parseProcessArgv<T extends Record<string, ObjectValues>>(
  args: string[],
  options: Options<keyof T> = []
): Partial<T> {
  const shortFlags = options.reduce((acc, curr) => {
    if (curr.shortFlag) acc[curr.shortFlag] = curr.name;
    return acc;
  }, {} as Record<string, ObjectValues>);

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
      // Assume boolean flag
      if (!argVal || argVal.startsWith('--')) {
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
