import { ValidationError } from './error';
import { InternalOptions, SimpleRecord, Value } from './types';
import { isSameType } from './utils';

const requiredSym = Symbol('isRequired');

type ParseObjLiteral<T> = {
  defaultValues: T;
  input: Partial<T>;
  options?: InternalOptions;
};

export async function parseObjectLiteral<T extends SimpleRecord>({
  defaultValues,
  input,
  options = new Map(),
}: ParseObjLiteral<T>): Promise<T> {
  const requiredArgs = [...options.values()].filter((opts) => opts.required);

  const config = new Map<string, Value | symbol>(Object.entries(defaultValues));

  // For each required argument, replace its value temporarily
  // with a symbol
  requiredArgs.forEach((arg) => {
    config.set(arg.name, requiredSym);
  });

  for (const [arg, argVal] of Object.entries(input)) {
    if (!config.has(arg)) continue;

    const customValidator = options.get(arg)?.customValidator;

    if (customValidator) {
      // Coerced truthy values are ignored
      if (customValidator.isValid(argVal) === true) {
        config.set(arg, argVal);
      } else {
        throw new ValidationError(customValidator.errorMessage(argVal));
      }
    }

    const expected = typeof defaultValues[arg];
    const received = typeof argVal;

    // The received type must corresponds to the original type
    if (isSameType(expected, received)) {
      config.set(arg, argVal);
    } else {
      throw new ValidationError(
        `Invalid type for "${arg}". Expected ${expected}, got ${received}`
      );
    }
  }

  // Check if all required arguments have been defined or if the
  // temporary value is still there
  requiredArgs.forEach((arg) => {
    if (config.get(arg.name) === requiredSym) {
      throw new ValidationError(`"${arg.name}" is required`);
    }
  }, <string[]>[]);

  return Object.fromEntries(config) as T;
}
