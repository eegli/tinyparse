import {
  FilePathArg,
  Flag,
  FlagAlias,
  FlagAliasMap,
  FlagAliasProps,
  FlagType,
  InternalOptions,
  ParserOptions,
  PrimitiveRecord,
} from './types';
import Utils from './utils';

export class Options {
  private readonly _opts: InternalOptions = new Map();
  private readonly _aliases: FlagAliasMap = new Map();

  public readonly shouldDecamelize: boolean;
  public readonly filePathArg?: FilePathArg;

  constructor(defaults: PrimitiveRecord, options: ParserOptions = {}) {
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
        longFlag = this.stripFlagPrefix(userOptions.longFlag as string);
      } else if (this.shouldDecamelize) {
        // Only decamelize if no custom long flag is provided AND
        // decamelize is enabled
        longFlag = Utils.decamelize(key);
      }

      this._addAliasIfNotExists(longFlag, {
        originalFlag: key,
        flagType: FlagType.Long,
      });

      // Short flags should be short, hence no decamelization
      if (userOptions.shortFlag) {
        shortFlag = this.stripFlagPrefix(userOptions.shortFlag);

        this._addAliasIfNotExists(shortFlag, {
          originalFlag: key,
          flagType: FlagType.Short,
        });
      }

      this._opts.set(key, {
        ...userOptions,
        required: !!userOptions.required,
        shortFlag,
        longFlag,
        _type: typeof value,
      });
    }

    if (this.filePathArg) {
      this.filePathArg.longFlag = this.stripFlagPrefix(
        this.filePathArg.longFlag
      );

      this._addAliasIfNotExists(this.filePathArg.longFlag, {
        originalFlag: this.filePathArg.longFlag,
        flagType: FlagType.Long,
      });
    }
    if (this.filePathArg?.shortFlag) {
      this.filePathArg.shortFlag = this.stripFlagPrefix(
        this.filePathArg.shortFlag
      );

      this._addAliasIfNotExists(this.filePathArg.shortFlag, {
        originalFlag: this.filePathArg.shortFlag,
        flagType: FlagType.Short,
      });
    }
  }

  private _addAliasIfNotExists(key: string, props: FlagAliasProps) {
    const existingAlias = this._aliases.get(key);
    if (!existingAlias) {
      this.aliases.set(key, props);
    } else {
      const conflicting = this._makeFlag(key, props.flagType);

      let text;
      let cause;
      if (
        props.flagType === FlagType.Short &&
        props.flagType === FlagType.Short
      ) {
        cause = 'short flags';
        text = `conflicting short flag: ${conflicting} has been declared twice`;
      } else {
        cause = 'custom long flags and decamelization';
        text = `conflicting long flag: ${conflicting} has been declared twice`;
      }

      throw new Error(
        `Parser config validation error, ${text}. Check your settings for ${cause}.`
      );
    }
  }

  public stripFlagPrefix(flag: string): Flag {
    return flag.trim().replace(/^-+/, '');
  }

  private _makeFlag(flag: string, type: FlagType): FlagAlias {
    flag = this.stripFlagPrefix(flag);
    const prefix = type === FlagType.Long ? '--' : '-';
    return `${prefix}${flag}`;
  }

  public entries() {
    return this._opts.entries();
  }

  public values() {
    return this._opts.values();
  }

  public get aliases() {
    return this._aliases;
  }

  public get options() {
    return this._opts;
  }
}
