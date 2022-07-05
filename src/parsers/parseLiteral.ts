import { ValidationError } from '../error';
import { ObjectValues, Options } from '../types';
import { isSameType } from '../utils';

const requiredSym = Symbol('isRequired');

export async function parseObjectLiteral<
  T extends Record<string, ObjectValues>
>(defaults: T, options: Options<keyof T>, args: Partial<T>): Promise<T> {
  const requiredArgs = options.filter((opt) => opt.required);

  const config = new Map<string, ObjectValues | symbol>(
    Object.entries(defaults)
  );

  // For each required argument, replace its value temporarily
  // with a symbol
  requiredArgs.forEach((r) => {
    config.set(r.name, requiredSym);
  });

  Object.entries(args).forEach(([arg, argVal]) => {
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
