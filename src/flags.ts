import { ValidationError } from './error';
import { FlagMap, FlagValue } from './types';
import Utils, { Type } from './utils';

export const collect = (
  flags: FlagMap,
  inputFlags: Map<string, string | boolean>,
) => {
  const output = new Map<string, FlagValue>();
  for (const [key, opts] of flags) {
    const { longFlag, shortFlag, required, defaultValue } = opts;
    // Try to match a long flag
    let argFlag = inputFlags.get(longFlag);
    if (!argFlag && shortFlag) {
      // Try to match a short flag
      argFlag = inputFlags.get(shortFlag);
    }
    // The flag is not present but required
    if (!argFlag) {
      if (required) {
        throw new ValidationError(`Missing required option ${longFlag}`);
      }
      output.set(key, defaultValue);
      continue;
    }

    const expectedType = Utils.getType(defaultValue);

    if (expectedType === Type.Boolean && typeof argFlag === 'boolean') {
      output.set(key, argFlag);
    } else if (expectedType === Type.String) {
      output.set(key, argFlag);
    } else if (expectedType === Type.Number) {
      const asNumber = Utils.tryToNumber(argFlag as string);
      if (asNumber) {
        output.set(key, asNumber);
      } else {
        throw new ValidationError(
          `Invalid type for ${longFlag}. "${
            argFlag as string
          }" is not a number`,
        );
      }
    } else if (expectedType === Type.Date) {
      const asDate = Utils.tryToDate(argFlag);
      if (asDate) {
        output.set(key, asDate);
      } else {
        throw new ValidationError(
          `Invalid type for ${longFlag}. "${argFlag}" is not a Date`,
        );
      }
    }
  }
  return Object.fromEntries(output);
};
