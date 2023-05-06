import { Collector } from './collector';
import { ValidationError } from './error';
import { BaseFlagOption, PrimitiveRecord, Value } from './types';
import Utils from './utils';

type InputState = Map<
  string,
  {
    value: unknown;
    // Keep track of how the input was received for error reporting
    receivedAs: string;
  }
>;

export class Parser<T extends PrimitiveRecord> {
  private _argvInput: InputState = new Map();
  private _fileInput: InputState = new Map();

  constructor(private readonly _options: Map<string, BaseFlagOption>) {}

  public withArgvInput(
    input: Map<string, unknown>,
    aliases: Map<string, string> = new Map()
  ): this {
    // New state on new input
    this._argvInput.clear();

    for (const [key, value] of input) {
      const maybeAlias = aliases.get(key);
      this._argvInput.set(maybeAlias ?? key, {
        value,
        receivedAs: key,
      });
    }
    return this;
  }

  public withFileInput(...flags: string[]): this {
    this._fileInput.clear();

    const filePaths = flags
      .map((v) => this._argvInput.get(v)?.value)
      .filter((v) => typeof v === 'string') as string[];

    if (filePaths.length === 0) return this;

    // Long flag takes precedence over short flag
    const filePath = filePaths[0];

    for (const [key, content] of Utils.parseJSONFile(filePath)) {
      this._fileInput.set(key, {
        value: content,
        receivedAs: key,
      });
    }

    // The file flags are not part of the output
    for (const flag of flags) {
      this._argvInput.delete(flag);
    }

    return this;
  }

  public parse(): Collector<T> {
    const output: Map<string, Value> = new Map();

    // Go through all expected keys and try to find them in the input
    for (const option of this._options) {
      const [key, keyOptions] = option;

      // Input from argv takes precedence over input from a file
      const entry = this._argvInput.get(key) ?? this._fileInput.get(key);

      if (!entry) {
        if (keyOptions?.isRequired) {
          throw new ValidationError(`Missing required argument ${key}`);
        }
        // Set default
        output.set(key, keyOptions.value);
        continue;
      }

      const customValidator = keyOptions?.validator;
      const expectedType = typeof keyOptions.value;

      // Iif the expected type is a number and not NaN, try to convert
      // the value
      if (expectedType === 'number') {
        entry.value = Utils.toNumber(entry.value);
      }

      if (customValidator) {
        if (customValidator.isValid(entry.value)) {
          output.set(key, entry.value);
        } else {
          throw new ValidationError(
            customValidator.errorMessage(entry.value, entry.receivedAs)
          );
        }
      } else {
        const receivedType = typeof entry.value;
        if (Utils.isValueType(entry.value) && receivedType === expectedType) {
          output.set(key, entry.value);
        } else {
          throw new ValidationError(
            `Invalid type for ${entry.receivedAs}. "${entry.value}" is not a ${expectedType}`
          );
        }
      }
    }

    return new Collector<T>(Object.fromEntries(output) as T);
  }
}
