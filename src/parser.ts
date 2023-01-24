import { ValidationError } from './error';
import { InternalOptions, SimpleRecord, Value } from './types';
import { isSameType } from './utils';

export class Parser<T extends SimpleRecord> {
  private readonly _requiredSym = Symbol('isRequired');

  constructor(private readonly _defaultValues: T) {}

  // eslint-disable-next-line require-await
  public async parse(input: Partial<T>, options: InternalOptions): Promise<T> {
    const config = new Map<string, Value | symbol>(
      Object.entries(this._defaultValues)
    );

    const requiredArgs = Array.from(options.entries())
      .filter(([, options]) => options.required)
      .map(([key]) => key);

    // For each required argument, replace its value temporarily
    // with a symbol
    requiredArgs.forEach((arg) => {
      config.set(arg, this._requiredSym);
    });

    for (const inputPair of Object.entries(input)) {
      const [arg] = inputPair;
      let [, argVal] = inputPair;

      if (!config.has(arg)) continue;

      const expectedType = typeof this._defaultValues[arg];

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
      if (config.get(arg) === this._requiredSym) {
        throw new ValidationError(`"${arg}" is required`);
      }
    }, <string[]>[]);

    return Object.fromEntries(config) as T;
  }
}
