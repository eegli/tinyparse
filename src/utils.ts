import { ObjectValues } from './types';

const allowedTypes = new Set(['string', 'number', 'boolean']);

export function isSameType(type: string, reference: string): boolean {
  return allowedTypes.has(type) && type === reference;
}

export function argvTransformer<
  V extends ObjectValues,
  R extends Record<string, V>
>(args: string[], shortFlagMap?: Record<string, V>): R {
  const map = args.reduce((acc, curr, idx, orig) => {
    if (
      shortFlagMap &&
      curr.startsWith('-') &&
      Object.prototype.hasOwnProperty.call(shortFlagMap, curr)
    ) {
      curr = '--' + shortFlagMap[curr];
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

  return Object.fromEntries(map) as R;
}
