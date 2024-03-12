import { ValidationError } from './error';
import { FlagOptions, FlagValue } from './types/internals';
import Utils, { Type } from './utils';

const assertIsOneOf = <T>({
  id,
  value,
  options,
  includeDefaultValue,
  defaultValue,
}: {
  id: string;
  value: T;
  defaultValue: T;
  includeDefaultValue?: boolean;
  options: T[];
}): void => {
  if (includeDefaultValue) {
    // Don't mutate the original array
    options = options.concat(defaultValue);
  }
  if (!options.includes(value)) {
    const available = options.sort().join(', ');
    const err = `Invalid value "${value}" for option ${id}, expected one of: ${available}`;
    throw new ValidationError(err);
  }
};

export const collectFlags = (
  inputFlags: Map<string, string | null>,
  flagOptions: Map<string, FlagOptions<FlagValue>>,
) => {
  const output = new Map<string, FlagValue>();
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
      if (argumentIsNull) {
        throw new ValidationError(`${longFlag} expects an argument`);
      }
      if (opts.oneOf) {
        assertIsOneOf({
          id: longFlag,
          value: flagArg,
          defaultValue: defaultValue,
          // If the option is required, do not include the default value as a valid value
          includeDefaultValue: !required,
          options: opts.oneOf,
        });
      }
      output.set(key, flagArg as string);
      continue;
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
      if (!asNumber) {
        throw new ValidationError(
          `Invalid type for ${longFlag}. '${
            flagArg as string
          }' is not a valid number`,
        );
      }
      if (opts.oneOf) {
        assertIsOneOf({
          id: longFlag,
          value: asNumber,
          defaultValue: defaultValue,

          includeDefaultValue: !required,
          options: opts.oneOf,
        });
      }
      output.set(key, asNumber);
      continue;
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
