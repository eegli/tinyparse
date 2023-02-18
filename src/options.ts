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

  private _ensureAliasDoesNotExist(alias: string) {
    let existingAlias = this._aliases.get(alias);
    if (existingAlias) {
      alias = this._removeFlagPrefix(alias);
      existingAlias = this._removeFlagPrefix(existingAlias);
      throw new Error(
        `Error validating parser config: An option for "${alias}" already exists: "${existingAlias}". This is likely because these options decamelize to the same name or you have set a conflicting flag.`
      );
    }
  }

  private _createAliasMap() {
    for (const [key, opts] of this._opts) {
      if (opts.shortFlag) {
        const shortFlag = this._makeFlag(opts.shortFlag, FlagType.Short);
        opts.shortFlag = shortFlag;
        this._ensureAliasDoesNotExist(shortFlag);
        this._aliases.set(shortFlag, key);
      }
      if (this.shouldDecamelize) {
        const decamelized = Utils.decamelize(key);
        const longFlag = this._makeFlag(decamelized, FlagType.Long);
        this._ensureAliasDoesNotExist(longFlag);
        this._aliases.set(longFlag, key);
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
