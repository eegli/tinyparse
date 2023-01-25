import { ValidationError } from './error';
import { Options } from './options';
import { SimpleRecord, Value } from './types';
import Utils from './utils';

export class Parser<T extends SimpleRecord> {
  private readonly _requiredSym = Symbol('isRequired');
  private _shouldDecamelizeError = false;

  constructor(private readonly _defaultValues: T) {}

  // eslint-disable-next-line require-await
  public async parse(
    input: Partial<T>,
    options: Options,
    fromArgv: boolean
  ): Promise<T> {
    const shouldDecamelize = fromArgv && options.shouldDecamelize;

    const formatFlag = (key: string) =>
      shouldDecamelize ? Utils.decamelize(key) : key;

    const config = new Map<string, Value | symbol>(
      Object.entries(this._defaultValues)
    );

    const requiredFlags = Array.from(options.entries())
      .filter(([, options]) => options.required)
      .map(([key]) => key);

    // For each required flag, replace its value temporarily
    // with a symbol
    requiredFlags.forEach((flag) => {
      config.set(flag, this._requiredSym);
    });

    for (const flagValuePair of Object.entries(input)) {
      const [flag] = flagValuePair;
      let [, flagValue] = flagValuePair;

      if (!config.has(flag)) continue;

      const expectedType = typeof this._defaultValues[flag];

      // Iif the expected type is a number, try to convert the value
      if (expectedType === 'number') {
        flagValue = Number(flagValue);
      }

      const receivedType = typeof flagValue;
      const customValidator = options.options.get(flag)?.customValidator;

      // Custom validation
      if (customValidator) {
        if (customValidator.isValid(flagValue)) {
          config.set(flag, flagValue);
        } else {
          throw new ValidationError(customValidator.errorMessage(flagValue));
        }
      }

      // Default validation (based on types) -  The received type must
      // corresponds to the original type
      if (Utils.isSameType(expectedType, receivedType)) {
        config.set(flag, flagValue);
      } else {
        const value = formatFlag(flag);
        throw new ValidationError(
          `Invalid type for "${value}". Expected ${expectedType}, got ${receivedType}`
        );
      }
    }

    // Check if all required arguments have been defined or if the
    // temporary value is still there
    requiredFlags.forEach((flag) => {
      if (config.get(flag) === this._requiredSym) {
        const value = formatFlag(flag);
        throw new ValidationError(`"${value}" is required`);
      }
    }, <string[]>[]);

    return Object.fromEntries(config) as T;
  }
}
