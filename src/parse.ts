import { ValidationError } from './error';
import { InternalOptions, ObjectValues, SimpleRecord } from './types';
import { isSameType } from './utils';

const requiredSym = Symbol('isRequired');

export async function parseObjectLiteral<T extends SimpleRecord>(
  defaults: T,
  input: Partial<T>,
  options: InternalOptions
): Promise<T> {
  const requiredArgs = options.filter((opt) => opt.required);

  const config = new Map<string, ObjectValues | symbol>(
    Object.entries(defaults)
  );

  // For each required argument, replace its value temporarily
  // with a symbol
  requiredArgs.forEach((arg) => {
    config.set(arg.name, requiredSym);
  });

  Object.entries(input).forEach(([arg, argVal]) => {
    if (!config.has(arg)) {
      return;
    }
    // The received type must corresponds to the original type
    const expected = typeof defaults[arg];
    const received = typeof argVal;
    if (isSameType(expected, received)) {
      config.set(arg, argVal);
    } else {
      throw new ValidationError(
        `Invalid type for "${arg}". Expected ${expected}, got ${received}`
      );
    }
  });

  // Check if all required arguments have been defined or if the
  // temporary value is still there
  requiredArgs.forEach((arg) => {
    if (config.get(arg.name) === requiredSym) {
      throw new ValidationError(`"${arg.name}" is required`);
    }
  }, <string[]>[]);

  return Object.fromEntries(config) as T;
}
