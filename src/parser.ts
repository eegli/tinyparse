import { ValidationError } from './error';
import { Options } from './options';
import { SimpleRecord, Value } from './types';
import Utils from './utils';

enum ErrorType {
  MissingRequired,
  InvalidType,
  Custom,
}

type ErrorArgs =
  | { type: ErrorType.MissingRequired; value: string }
  | {
      type: ErrorType.InvalidType;
      value: string;
      expectedType: string;
      receivedType: string;
    }
  | { type: ErrorType.Custom; value: string };

export class Parser<T extends SimpleRecord> {
  private readonly _requiredSym = Symbol('isRequired');
  private _shouldDecamelizeError = false;

  constructor(private readonly _defaultValues: T) {}

  private _throw(p: ErrorArgs): never {
    const { type } = p;
    const value = this._shouldDecamelizeError
      ? Utils.decamelize(p.value)
      : p.value;

    switch (type) {
      case ErrorType.MissingRequired:
        throw new ValidationError(`"${value}" is required`);
      case ErrorType.InvalidType:
        throw new ValidationError(
          `Invalid type for "${value}". Expected ${p.expectedType}, got ${p.receivedType}`
        );
      case ErrorType.Custom:
        throw new ValidationError(value);
    }
  }

  // eslint-disable-next-line require-await
  public async parse(
    input: Partial<T>,
    options: Options,
    fromArgv: boolean
  ): Promise<T> {
    this._shouldDecamelizeError = fromArgv && options.shouldDecamelize;

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

      let argNameToThrow = flag;
      if (fromArgv && options.shouldDecamelize) {
        argNameToThrow = Utils.decamelize(argNameToThrow);
      }

      // Custom validation
      if (customValidator) {
        if (customValidator.isValid(flagValue)) {
          config.set(flag, flagValue);
        } else {
          this._throw({
            type: ErrorType.Custom,
            value: customValidator.errorMessage(flagValue),
          });
        }
      }

      // Default validation (based on types) -  The received type must
      // corresponds to the original type
      if (Utils.isSameType(expectedType, receivedType)) {
        config.set(flag, flagValue);
      } else {
        this._throw({
          type: ErrorType.InvalidType,
          value: flag,
          expectedType,
          receivedType,
        });
      }
    }

    // Check if all required arguments have been defined or if the
    // temporary value is still there
    requiredFlags.forEach((flag) => {
      if (config.get(flag) === this._requiredSym) {
        this._throw({
          type: ErrorType.MissingRequired,
          value: flag,
        });
      }
    }, <string[]>[]);

    return Object.fromEntries(config) as T;
  }
}
