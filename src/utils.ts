import { ObjectValues, OptionsObject } from './types';

export function getOptionByKey<T extends OptionsObject<string>>(
  key: string,
  options: T[] = []
): T | undefined {
  return options.find((opt) => opt.name === key);
}

export function argvTransformer(
  args: string[],
  shortFlagMap?: Record<string, ObjectValues>
): Record<string, ObjectValues> {
  return args.reduce((acc, curr, idx, orig) => {
    if (
      shortFlagMap &&
      curr.startsWith('-') &&
      Object.prototype.hasOwnProperty.call(shortFlagMap, curr)
    ) {
      curr = '--' + shortFlagMap[curr];
    }
    if (curr.startsWith('--')) {
      const arg = curr.slice(2);
      const argVal: ObjectValues = orig[idx + 1];
      // Assume boolean flag
      if (!argVal || argVal.startsWith('--')) {
        acc[arg] = true;
        // Assume number
      } else if (/^\d+$/.test(argVal)) {
        acc[arg] = +argVal;
        // Assume string
      } else {
        acc[arg] = argVal;
      }
    }
    return acc;
  }, {} as Record<string, ObjectValues>);
}
