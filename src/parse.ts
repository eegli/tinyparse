import { ValidationError } from './error';
import {
  InternalOptions,
  PositionalArgs,
  SimpleRecord,
  Value,
  WithPositionalArgs,
} from './types';
import { isSameType } from './utils';

const requiredSym = Symbol('isRequired');

type ParseObjLiteral<T> = {
  defaultValues: T;
  input: Partial<T>;
  positionalArgs: PositionalArgs;
  options?: InternalOptions;
};

// eslint-disable-next-line require-await
export async function parseObjectLiteral<T extends SimpleRecord>({
  defaultValues,
  input,
  options = new Map(),
  positionalArgs,
}: ParseObjLiteral<T>): Promise<WithPositionalArgs<T>> {
  const requiredArgs = [...options.values()].filter((opts) => opts.required);

  const config = new Map<string, Value | symbol>(Object.entries(defaultValues));

  // For each required argument, replace its value temporarily
  // with a symbol
  requiredArgs.forEach((arg) => {
    config.set(arg.name, requiredSym);
  });

  for (const inputPair of Object.entries(input)) {
    const [arg] = inputPair;
    let [, argVal] = inputPair;

    if (!config.has(arg)) continue;

    const expectedType = typeof defaultValues[arg];

    // Iif the expected type is a number, try to convert the value
    if (expectedType === 'number') {
      argVal = Number(argVal);
    }

    const receivedType = typeof argVal;
    const customValidator = options.get(arg)?.customValidator;

    // Custom validation
    if (customValidator) {
      if (customValidator.isValid(argVal)) {
        config.set(arg, argVal);
      } else {
        throw new ValidationError(customValidator.errorMessage(argVal));
      }
    }

    // Default validation (based on types) -  The received type must
    // corresponds to the original type
    if (isSameType(expectedType, receivedType)) {
      config.set(arg, argVal);
    } else {
      throw new ValidationError(
        `Invalid type for "${arg}". Expected ${expectedType}, got ${receivedType}`
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

  return { ...(Object.fromEntries(config) as T), _: positionalArgs };
}
