import { ValidationError } from './error';
import { InternalOption, ObjectValues, SimpleRecord } from './types';
import { isSameType } from './utils';

const requiredSym = Symbol('isRequired');

type ParseObjLiteral<T> = {
  defaultValues: T;
  input: Partial<T>;
  options: InternalOption[];
};

export async function parseObjectLiteral<T extends SimpleRecord>({
  defaultValues,
  input,
  options,
}: ParseObjLiteral<T>): Promise<T> {
  const requiredArgs = options.filter((opt) => opt.required);

  const config = new Map<string, ObjectValues | symbol>(
    Object.entries(defaultValues)
  );

  // For each required argument, replace its value temporarily
  // with a symbol
  requiredArgs.forEach((arg) => {
    config.set(arg.name, requiredSym);
  });

  for (const [arg, argVal] of Object.entries(input)) {
    if (!config.has(arg)) continue;

    const customValidator = options.find(
      (v) => v.name === arg && v.customValidator
    )?.customValidator;

    const expected = typeof defaultValues[arg];
    const received = typeof argVal;

    if (customValidator) {
      if (customValidator.validate(argVal)) {
        config.set(arg, argVal);
      } else {
        throw new ValidationError(customValidator.reason(argVal));
      }
    }

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
