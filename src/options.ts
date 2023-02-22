import {
  AliasMap,
  FlagType,
  InternalKeyOptions,
  OptionMap,
  ParserOptions,
  PrimitiveRecord,
} from './types';
import Utils from './utils';

export class Options {
  private readonly _options: OptionMap = new Map();
  private readonly _aliases: AliasMap = new Map();

  public readonly shouldDecamelize: boolean;
  public readonly filePathFlags: Set<string>;
  public readonly filePathFlagDesc?: string;

  constructor(defaults: PrimitiveRecord = {}, options: ParserOptions = {}) {
    // Global options
    this.shouldDecamelize = !!options.decamelize;

    const { longFlag, shortFlag } = options.filePathArg ?? {};

    this.filePathFlagDesc = options.filePathArg?.description;
    this.filePathFlags = new Set();

    if (longFlag) {
      this.filePathFlags.add(Utils.makeLongFlag(longFlag));
    }
    if (shortFlag) {
      this.filePathFlags.add(Utils.makeShortFlag(shortFlag));
    }

    // Merge option keys/flags with user-provided options
    for (const [key, value] of Object.entries(defaults)) {
      const userOptions = options.options?.[key] ?? {};

      let longFlag = key;
      if (userOptions.longFlag) {
        longFlag = userOptions.longFlag;
      } else if (this.shouldDecamelize) {
        // Only decamelize if no custom long flag is provided AND
        // decamelize is enabled
        longFlag = Utils.decamelize(key);
      }

      longFlag = Utils.makeLongFlag(longFlag);
      this._addAlias(longFlag, FlagType.Long, key);

      // Short flags should be short, hence no decamelization
      let shortFlag: string | undefined;
      if (userOptions.shortFlag) {
        shortFlag = Utils.makeShortFlag(userOptions.shortFlag);
        this._addAlias(shortFlag, FlagType.Short, key);
      }
      const keyOptions = {
        ...userOptions,
        longFlag,
        required: !!userOptions.required,
        _type: typeof value,
        _value: value,
      };
      if (shortFlag) keyOptions.shortFlag = shortFlag;

      this._options.set(key, keyOptions);
    }
  }

  private _addAlias(alias: string, flagType: FlagType, forKey: string) {
    const existingFilePathFlag = this.filePathFlags.has(alias);
    if (existingFilePathFlag) {
      throw new Error();
    }

    const existingAlias = this._aliases.get(alias);
    if (existingAlias) {
      let text = `conflicting long flag: ${alias} has been declared twice`;
      let cause = 'custom long flags and decamelization';
      if (flagType === FlagType.Short) {
        cause = 'short flags';
        text = `conflicting short flag: ${alias} has been declared twice`;
      }

      throw new Error(
        `Parser config validation error, ${text}. Check your settings for ${cause}.`
      );
    }

    this.aliases.set(alias, forKey);
  }

  public entry(key: string) {
    return this._options.get(key);
  }

  // Explicit annotation due to TS4053
  public entries(): [string, InternalKeyOptions][] {
    return [...this._options.entries()];
  }

  // Explicit annotation due to TS4053
  public values(): InternalKeyOptions[] {
    return [...this._options.values()];
  }

  public get aliases() {
    return this._aliases;
  }
}
