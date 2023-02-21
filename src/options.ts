import {
  AliasConfig,
  FilePathArg,
  FlagType,
  InternalKeyOptions,
  ParserOptions,
  PrimitiveRecord,
} from './types';
import Utils from './utils';

export class Options {
  private readonly _options: Map<string, InternalKeyOptions> = new Map();
  private readonly _aliases: Map<string, AliasConfig> = new Map();

  public readonly shouldDecamelize: boolean;
  public readonly filePathArg?: FilePathArg;

  constructor(defaults: PrimitiveRecord = {}, options: ParserOptions = {}) {
    // Global options
    this.shouldDecamelize = !!options.decamelize;
    this.filePathArg = options.filePathArg;

    // Merge option keys/flags with user-provided options
    for (const [key, value] of Object.entries(defaults)) {
      const userOptions = options.options?.[key] ?? {};
      const isCustomLongFlag = !!userOptions.longFlag;

      let longFlag = key;
      let shortFlag: string | undefined;

      if (isCustomLongFlag) {
        longFlag = Utils.trimFlag(userOptions.longFlag as string);
      } else if (this.shouldDecamelize) {
        // Only decamelize if no custom long flag is provided AND
        // decamelize is enabled
        longFlag = Utils.decamelize(key);
      }

      this._addAliasIfNotExists(longFlag, {
        forKey: key,
        flagType: FlagType.Long,
      });

      // Short flags should be short, hence no decamelization
      if (userOptions.shortFlag) {
        shortFlag = Utils.trimFlag(userOptions.shortFlag);

        this._addAliasIfNotExists(shortFlag, {
          forKey: key,
          flagType: FlagType.Short,
        });
      }

      this._options.set(key, {
        ...userOptions,
        required: !!userOptions.required,
        shortFlag,
        longFlag,
        _type: typeof value,
        _value: value,
      });
    }

    if (this.filePathArg) {
      this.filePathArg.longFlag = Utils.trimFlag(this.filePathArg.longFlag);

      this._addAliasIfNotExists(this.filePathArg.longFlag, {
        forKey: this.filePathArg.longFlag,
        flagType: FlagType.Long,
      });
    }
    if (this.filePathArg?.shortFlag) {
      this.filePathArg.shortFlag = Utils.trimFlag(this.filePathArg.shortFlag);

      this._addAliasIfNotExists(this.filePathArg.shortFlag, {
        forKey: this.filePathArg.shortFlag,
        flagType: FlagType.Short,
      });
    }
  }

  private _addAliasIfNotExists(alias: string, aliasConfig: AliasConfig) {
    const existingAlias = this._aliases.get(alias);
    if (!existingAlias) {
      this.aliases.set(alias, aliasConfig);
    } else {
      const conflicting = Utils.makeFlag(alias, aliasConfig.flagType);

      let text = `conflicting long flag: ${conflicting} has been declared twice`;
      let cause = 'custom long flags and decamelization';
      if (
        aliasConfig.flagType === FlagType.Short &&
        aliasConfig.flagType === FlagType.Short
      ) {
        cause = 'short flags';
        text = `conflicting short flag: ${conflicting} has been declared twice`;
      }

      throw new Error(
        `Parser config validation error, ${text}. Check your settings for ${cause}.`
      );
    }
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

  [Symbol.iterator]() {
    return this._options.entries();
  }
}
