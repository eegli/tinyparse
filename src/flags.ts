import { ValidationError } from './error';
import { FlagDefaultValue, FlagOptions } from './types';
import Utils, { Type } from './utils';

export const collect = (
  inputFlags: Map<string, string | null>,
  flagOptions: Map<string, FlagOptions>,
) => {
  const output = new Map<string, FlagDefaultValue>();
  for (const [key, opts] of flagOptions) {
    const { longFlag, shortFlag, required, defaultValue } = opts;
    // Try to match a long flag - null is a valid flag argument which
    // occurs as a shortcut for boolean flags
    let flagArg = inputFlags.get(longFlag);
    if (flagArg === undefined && shortFlag) {
      // Try to match a short flag
      flagArg = inputFlags.get(shortFlag);
    }
    // The flag is not present but required
    if (flagArg === undefined) {
      if (required) {
        throw new ValidationError(`Missing required option ${longFlag}`);
      }
      output.set(key, defaultValue);
      continue;
    }

    const expectedArgType = Utils.typeof(defaultValue);
    const argumentIsNull = flagArg === null;

    if (expectedArgType === Type.String) {
      if (!argumentIsNull) {
        output.set(key, flagArg as string);
        continue;
      }
      throw new ValidationError(`${longFlag} expects an argument`);
    }
    if (expectedArgType === Type.Boolean) {
      if (argumentIsNull) {
        // No flag argument is a shortcut for trueish boolean flags
        output.set(key, true);
      } else if (flagArg === 'true') {
        output.set(key, true);
      } else if (flagArg === 'false') {
        output.set(key, false);
      } else {
        throw new ValidationError(
          `Invalid argument for ${longFlag}. '${flagArg}' must be 'true' or 'false'`,
        );
      }
    }
    if (expectedArgType === Type.Number) {
      const asNumber = Utils.tryToNumber(flagArg as string);
      if (asNumber) {
        output.set(key, asNumber);
        continue;
      }
      throw new ValidationError(
        `Invalid type for ${longFlag}. '${
          flagArg as string
        }' is not a valid number`,
      );
    }
    if (expectedArgType === Type.Date) {
      const asDate = Utils.tryToDate(flagArg as string);
      if (asDate) {
        output.set(key, asDate);
        continue;
      }
      throw new ValidationError(
        `Invalid type for ${longFlag}. '${flagArg}' is not a valid date`,
      );
    }
  }
  return Object.fromEntries(output);
};
