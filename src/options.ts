import {
  FilePathArg,
  Flag,
  FlagAlias,
  FlagAliasMap,
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
      // Short flags should be short, hence no decamelization
      if (opts.shortFlag) {
        const shortFlag = this.stripFlagPrefix(opts.shortFlag);
        this._ensureAliasDoesNotExist(shortFlag);
        opts.shortFlag = shortFlag;
        this._aliases.set(shortFlag, {
          flag: key,
          type: FlagType.Short,
        });
      }
      let longFlag = key;
      // Custom long flags take precedence over decamelization settings
      if (opts.longFlag) {
        longFlag = this.stripFlagPrefix(opts.longFlag);
      }
      // Only decamelize if no custom long flag is provided AND
      // decamelize is enabled
      else if (this.shouldDecamelize) {
        longFlag = Utils.decamelize(key);
      }
      this._ensureAliasDoesNotExist(longFlag);
      opts.longFlag = longFlag;
      this._aliases.set(longFlag, {
        flag: key,
        type: FlagType.Long,
      });
    }

    if (this.filePathArg) {
      this.filePathArg.longFlag = this.stripFlagPrefix(
        this.filePathArg.longFlag
      );
      this._ensureAliasDoesNotExist(this.filePathArg.longFlag);
      this._aliases.set(this.filePathArg.longFlag, {
        flag: this.filePathArg.longFlag,
        type: FlagType.Long,
      });
    }
    if (this.filePathArg?.shortFlag) {
      this.filePathArg.shortFlag = this.stripFlagPrefix(
        this.filePathArg.shortFlag
      );
      this._ensureAliasDoesNotExist(this.filePathArg.shortFlag);
      this._aliases.set(this.filePathArg.shortFlag, {
        flag: this.filePathArg.shortFlag,
        type: FlagType.Short,
      });
    }
  }

  private _ensureAliasDoesNotExist(alias: string) {
    const existingAlias = this._aliases.get(alias);
    if (!existingAlias) return;
    alias = this._makeFlag(alias, existingAlias.type);
    const causes = [];
    let text;

    if (existingAlias.type === FlagType.Long) {
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

  public get aliases() {
    return this._aliases;
  }

  public get options() {
    return this._opts;
  }
}
