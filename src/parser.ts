import { ValidationError } from './error';
import { Options } from './options';
import { PrimitiveRecord, Value, WithPositionalArgs } from './types';
import Utils from './utils';

export class Parser<T extends PrimitiveRecord> {
  private readonly _requiredSym = Symbol('isRequired');

  constructor(private readonly _options = new Options()) {}

  public appendFromFile<T extends Map<string, unknown>>(
    collection: T,
    ...flags: string[]
  ): T {
    if (flags.length === 0) return collection;

    const filePaths = flags
      .map((v) => collection.get(v))
      .filter((v) => typeof v === 'string') as string[];

    if (filePaths.length === 0) return collection;

    // Long flag takes precedence over short flag
    const filePath = filePaths[0];

    for (const [key, content] of Utils.parseJSONFile(filePath)) {
      collection.set(Utils.makeLongFlag(key), content);
    }

    for (const flag of flags) {
      collection.delete(flag);
    }

    return collection;
  }

  // Try to convert a string to a number. If the result is NaN, return identity
  public tryConvertToNumber(value: unknown): unknown {
    if (typeof value !== 'string') return value;
    const num = +value;
    return !Number.isNaN(num) ? num : value;
  }

  public parse(input: Map<string, unknown>): T {
    // Append file content to the input
    // File contents may be overridden by user input
    input = this.appendFromFile(input, ...this._options.filePathFlags);

    const config = new Map<string, Value | symbol>(
      this._options.entries().map(([key, entry]) => [key, entry._value])
    );

    const requiredKeys = this._options
      .entries()
      .filter(([, opts]) => opts.required);

    // For each required flag, replace its value temporarily
    // with a symbol
    for (const [key] of requiredKeys) {
      config.set(key, this._requiredSym);
    }

    // E.g., ["--fooFlag", "barValue"]
    for (const flagValuePair of input) {
      const [flag] = flagValuePair;
      const maybeAlias = this._options.aliases.get(flag);

      if (!maybeAlias) continue;

      let [, flagValue] = flagValuePair;

      const key = Utils.trimFlag(maybeAlias);
      const expectedType = typeof this._options.entry(key)?._value;

      const customValidator = this._options.entry(key)?.customValidator;

      // Iif the expected type is a number and not NaN, try to convert
      // the value
      if (expectedType === 'number') {
        flagValue = this.tryConvertToNumber(flagValue);
      }

      // Custom validation
      if (customValidator) {
        if (customValidator.isValid(flagValue)) {
          config.set(key, flagValue);
        } else {
          const errorMessage = customValidator.errorMessage(flagValue, flag);
          throw new ValidationError(errorMessage);
        }
      }

      const receivedType = typeof flagValue;

      // Default validation (based on types) -  The received type must
      // corresponds to the original type

      if (Utils.isValueType(flagValue) && receivedType === expectedType) {
        config.set(key, flagValue);
      } else {
        throw new ValidationError(
          `Invalid type for ${flag}. "${flagValue}" is not a ${expectedType}`
        );
      }
    }

    // Check if all required arguments have been defined or if the
    // temporary value is still there
    for (const [key, keyOpts] of requiredKeys) {
      if (config.get(key) === this._requiredSym) {
        throw new ValidationError(`Missing required flag ${keyOpts.longFlag}`);
      }
    }

    return Object.fromEntries(config) as T;
  }

  public build(input: T, positionals: string[]): WithPositionalArgs<T> {
    return {
      ...input,
      _: positionals,
    };
  }
}
