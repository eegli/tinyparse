import {
  FilePathArg,
  Flag,
  FlagAlias,
  InternalOptions,
  ParserOptions,
  PrimitiveRecord,
} from './types';
import Utils from './utils';

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
        const shortFlag = this._makeFlag(opts.shortFlag, 'short');
        this._aliases.set(shortFlag, key);
        opts.shortFlag = shortFlag;
      }
      if (this.shouldDecamelize) {
        const decamelized = Utils.decamelize(key);
        if (decamelized !== key) {
          const longFlag = this._makeFlag(decamelized, 'long');
          this._aliases.set(longFlag, key);
        }
      }
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

  private _removeFlagPrefix(flag: string): Flag {
    return flag.trim().replace(/^-+/, '');
  }

  private _makeFlag(flag: string, type: 'long' | 'short'): FlagAlias {
    flag = this._removeFlagPrefix(flag);
    const prefix = type === 'long' ? '--' : '-';
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
