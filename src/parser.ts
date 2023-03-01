import { ValidationError } from './error';
import {
  AliasMap,
  FlagOptions,
  PrimitiveRecord,
  WithPositionalArgs,
} from './types';
import Utils from './utils';

export class Parser<T extends PrimitiveRecord> {
  private _current: Map<string, unknown> = new Map();

  // Try to convert a string to a number. If the result is NaN, return identity
  public tryConvertToNumber(value: unknown): unknown {
    if (typeof value !== 'string') return value;
    const num = +value;
    return !Number.isNaN(num) ? num : value;
  }

  public input(input: Map<string, unknown>): this {
    // New state on new input
    this._current = new Map();
    for (const [key, value] of input) {
      this._current.set(key, value);
    }
    return this;
  }

  // Append file content to the input
  // File contents may be overridden by user input
  public extendFromFile(...flags: string[]): this {
    if (flags.length === 0) return this;

    const filePaths = flags
      .map((v) => this._current.get(v))
      .filter((v) => typeof v === 'string') as string[];

    if (filePaths.length === 0) return this;

    // Long flag takes precedence over short flag
    const filePath = filePaths[0];

    for (const [key, content] of Utils.parseJSONFile(filePath)) {
      // Do not override CLI input
      if (this._current.has(key)) continue;
      this._current.set(key, content);
    }

    for (const flag of flags) {
      this._current.delete(flag);
    }

    return this;
  }

  public validate(options: FlagOptions, aliases: AliasMap = new Map()): this {
    const requiredKeys = [...options.entries()].reduce((acc, [key, value]) => {
      if (value?.isRequired) acc.add(key);
      return acc;
    }, new Set<string>());

    for (const kvPair of this._current) {
      const [flag] = kvPair;
      // Preserve original flag
      let key = flag;

      // Resolve alias
      const maybeAlias = aliases.get(flag);
      if (maybeAlias) key = maybeAlias;

      // Lookup options
      const keyOptions = options.get(key);

      if (!keyOptions) {
        // Invalid/unknown key
        this._current.delete(key);
        continue;
      }
      let [, value] = kvPair;
      const { type: expectedType, validator } = keyOptions;

      // Iif the expected type is a number and not NaN, try to convert
      // the value
      if (expectedType === 'number') {
        value = this.tryConvertToNumber(value);
      }

      const receivedType = typeof value;

      if (validator) {
        if (validator.isValid(value)) {
          this._current.set(key, value);
        } else {
          throw new ValidationError(validator.errorMessage(value, flag));
        }
      } else {
        if (Utils.isValueType(value) && receivedType === expectedType) {
          this._current.set(key, value);
        } else {
          throw new ValidationError(
            `Invalid type for ${flag}. "${value}" is not a ${expectedType}`
          );
        }
      }
      requiredKeys.delete(key);
    }

    for (const key of requiredKeys) {
      throw new ValidationError(`Missing required argument ${key}`);
    }

    return this;
  }

  public collectWithPositionals(positionals: string[]): WithPositionalArgs<T> {
    return {
      ...this.collect(),
      _: positionals,
    };
  }

  public collect(): T {
    return Object.fromEntries(this._current) as T;
  }
}
