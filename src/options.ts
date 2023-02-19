import {
  FilePathArg,
  Flag,
  FlagAlias,
  InternalOptions,
  ParserOptions,
  PrimitiveRecord,
} from './types';
import Utils from './utils';

enum FlagType {
  Short,
  Long,
}

export class Options {
  private readonly _opts: InternalOptions = new Map();
  private readonly _aliases: Map<FlagAlias, Flag> = new Map();

  public readonly shouldDecamelize: boolean;
  public readonly filePathArg?: FilePathArg;

  constructor(defaults: PrimitiveRecord, options: ParserOptions = {}) {
    // Merge option keys/flags with user-provided options
    for (const [key, value] of Object.entries(defaults)) {
      const keyOptions = { ...options.options?.[key], _type: typeof value };
      this._opts.set(key, keyOptions);
    }

    // Global options
    this.shouldDecamelize = !!options.decamelize;
    this.filePathArg = options.filePathArg;

    // Create alias map
    this._createAliasMap();
  }

  private _createAliasMap() {
    for (const [key, opts] of this._opts) {
      if (opts.shortFlag) {
        const shortFlag = this._makeFlag(opts.shortFlag, FlagType.Short);
        this._ensureAliasDoesNotExist(shortFlag);
        opts.shortFlag = shortFlag;
        this._aliases.set(shortFlag, key);
      }
      let longFlag = this._makeFlag(key, FlagType.Long);
      // Custom long flags take precedence over decamelization settings
      if (opts.longFlag) {
        longFlag = this._makeFlag(opts.longFlag, FlagType.Long);
      } else if (this.shouldDecamelize) {
        const decamelized = Utils.decamelize(key);
        longFlag = this._makeFlag(decamelized, FlagType.Long);
      }
      this._ensureAliasDoesNotExist(longFlag);
      opts.longFlag = longFlag;
      this._aliases.set(longFlag, key);
    }

    if (this.filePathArg) {
      this.filePathArg.longFlag = this._removeFlagPrefix(
        this.filePathArg.longFlag
      );
    }
    if (this.filePathArg?.shortFlag) {
      this.filePathArg.shortFlag = this._removeFlagPrefix(
        this.filePathArg.shortFlag
      );
    }
  }

  private _ensureAliasDoesNotExist(alias: string) {
    if (this._aliases.get(alias)) {
      const [, isLongFlag] = Utils.getFlagType(alias);
      const causes = [];
      let text;

      if (isLongFlag) {
        if (this.shouldDecamelize) {
          causes.push('decamelization');
        }
        text = `conflicting long flag: ${alias} has been declared twice`;
      } else {
        causes.push('short flags');
        text = `conflicting short flag: ${alias} has been declared twice`;
      }

      throw new Error(
        `Parser config validation error, ${text}. Check your settings for ${causes.join(
          ', '
        )}.`
      );
    }
  }

  private _removeFlagPrefix(flag: string): Flag {
    return flag.trim().replace(/^-+/, '');
  }

  private _makeFlag(flag: string, type: FlagType): FlagAlias {
    flag = this._removeFlagPrefix(flag);
    const prefix = type === FlagType.Long ? '--' : '-';
    return `${prefix}${flag}`;
  }

  public entries() {
    return this._opts.entries();
  }

  public get aliases() {
    return this._aliases;
  }

  public get options() {
    return this._opts;
  }
}
