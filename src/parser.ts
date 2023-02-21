import { ValidationError } from './error';
import { Options } from './options';
import { PrimitiveRecord, Value } from './types';
import Utils from './utils';

export class Parser<T extends PrimitiveRecord> {
  private readonly _requiredSym = Symbol('isRequired');

  constructor(private readonly _defaultValues: T) {}

  public appendFromFile<T extends Map<string, unknown>>(
    input: T,
    longFlag?: string,
    shortFlag?: string
  ): T {
    longFlag = longFlag && Utils.makeLongFlag(longFlag);
    shortFlag = shortFlag && Utils.makeShortFlag(shortFlag);

    const flags = [longFlag, shortFlag];
    if (flags.length === 0) return input;

    const filePaths = flags
      .map((flag) => flag && input.get(flag))
      .filter((value) => typeof value === 'string') as string[];

    if (filePaths.length === 0) return input;

    // Long flag takes precedence over short flag
    const filePath = filePaths[0];
    for (const [key, content] of Utils.parseJSONFile(filePath)) {
      input.set(Utils.makeLongFlag(key), content);
    }

    shortFlag && input.delete(Utils.makeShortFlag(shortFlag));
    longFlag && input.delete(Utils.makeLongFlag(longFlag));

    return input;
  }

  public parse(input: Map<string, unknown>, options: Options): T {
    // Append file content to the input
    input = this.appendFromFile(
      input,
      options.filePathArg?.longFlag,
      options.filePathArg?.shortFlag
    );

    const config = new Map<string, Value | symbol>(
      Object.entries(this._defaultValues)
    );

    const requiredKeys = Array.from(options.entries()).filter(
      ([, options]) => options.required
    );

    // For each required flag, replace its value temporarily
    // with a symbol
    for (const [key] of requiredKeys) {
      config.set(key, this._requiredSym);
    }

    // E.g., ["--fooFlag", "barValue"]
    for (const flagValuePair of input) {
      const [flag] = flagValuePair;
      let [, flagValue] = flagValuePair;
      const maybeAlias = options.aliases.get(Utils.trimFlag(flag));

      if (!maybeAlias) continue;

      const key = maybeAlias.forKey;
      const expectedType = typeof this._defaultValues[key];

      const customValidator = options.options.get(key)?.customValidator;

      // Iif the expected type is a number and not NaN, try to convert
      // the value
      if (expectedType === 'number' && Utils.isNumericString(flagValue)) {
        flagValue = Number(flagValue);
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
        throw new ValidationError(
          `Missing required flag --${keyOpts.longFlag}`
        );
      }
    }

    return Object.fromEntries(config) as T;
  }
}
