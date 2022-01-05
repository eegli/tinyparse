import { ObjectValues } from './factory';

export function argvTransformer(
  args: string[],
  shortFlagMap?: Record<string, ObjectValues>
): Record<string, ObjectValues> {
  // Hi
  return args.reduce((acc, curr, idx, orig) => {
    if (shortFlagMap && curr.startsWith('-') && shortFlagMap[curr.slice(1)]) {
      curr = '--' + shortFlagMap[curr.slice(1)];
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
