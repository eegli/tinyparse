import { ValidationError } from './error';
import {
  AliasMap,
  FlagOptions,
  PrimitiveRecord,
  Value,
  WithPositionalArgs,
} from './types';
import Utils from './utils';

export class Parser<T extends PrimitiveRecord> {
  private _input: Map<
    string,
    {
      value: unknown;
      // Keep track of how the input was received for error reporting
      receivedAs: string;
    }
  > = new Map();
  private _output: Map<string, Value> = new Map();

  // Try to convert a string to a number. If the result is NaN, return identity
  public tryConvertToNumber(value: unknown): unknown {
    if (typeof value !== 'string') return value;
    const num = +value;
    return !Number.isNaN(num) ? num : value;
  }

  public withArgvInput(
    input: Map<string, unknown>,
    aliases: AliasMap = new Map()
  ): this {
    // New state on new input
    this._input = new Map();
    for (const [key, value] of input) {
      const maybeAlias = aliases.get(key);
      this._input.set(maybeAlias ?? key, {
        value,
        receivedAs: key,
      });
    }
    return this;
  }

  // Append file content to the input
  // File contents may be overridden by user input
  public withFileInput(...flags: string[]): this {
    if (flags.length === 0) return this;

    const filePaths = flags
      .map((v) => this._input.get(v)?.value)
      .filter((v) => typeof v === 'string') as string[];

    if (filePaths.length === 0) return this;

    // Long flag takes precedence over short flag
    const filePath = filePaths[0];

    for (const [key, content] of Utils.parseJSONFile(filePath)) {
      // Skip if key already exists
      if (this._input.has(key)) continue;

      this._input.set(key, {
        value: content,
        receivedAs: key,
      });
    }

    for (const flag of flags) {
      this._input.delete(flag);
    }

    return this;
  }

  public validate(options: FlagOptions): this {
    this._output = new Map();

    for (const option of options) {
      const [key, keyOptions] = option;

      const entry = this._input.get(key);

      if (!entry) {
        if (keyOptions?.isRequired) {
          throw new ValidationError(`Missing required argument ${key}`);
        }
        continue;
      }

      const { type: expectedType, validator } = keyOptions;

      // Iif the expected type is a number and not NaN, try to convert
      // the value
      if (expectedType === 'number') {
        entry.value = this.tryConvertToNumber(entry.value);
      }

      if (validator) {
        if (validator.isValid(entry.value)) {
          this._output.set(key, entry.value);
        } else {
          throw new ValidationError(
            validator.errorMessage(entry.value, entry.receivedAs)
          );
        }
      } else {
        const receivedType = typeof entry.value;
        if (Utils.isValueType(entry.value) && receivedType === expectedType) {
          this._output.set(key, entry.value);
        } else {
          throw new ValidationError(
            `Invalid type for ${entry.receivedAs}. "${entry.value}" is not a ${expectedType}`
          );
        }
      }
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
    return Object.fromEntries(this._output) as T;
  }
}
