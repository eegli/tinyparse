import {
  FilePathArg,
  InternalOptions,
  ParserParams,
  SimpleRecord,
} from './types';
import { decamelize } from './utils';

export class Options {
  private readonly _opts: InternalOptions = new Map();
  private readonly _aliases: Map<string, string> = new Map();

  public readonly shouldDecamelize: boolean;
  public readonly filePathFlag?: FilePathArg;

  constructor(defaults: SimpleRecord, options: ParserParams = {}) {
    // Merge option keys/flags with user-provided options
    for (const [key, value] of Object.entries(defaults)) {
      const keyOptions = { ...options.options?.[key], _type: typeof value };
      this._opts.set(key, keyOptions);
    }

    // Global options
    this.shouldDecamelize = !!options.decamelize;
    this.filePathFlag = options.filePathArg;

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
        const decamelized = decamelize(key);
        if (decamelized !== key) {
          const longFlag = this._makeFlag(decamelized, 'long');
          this._aliases.set(longFlag, key);
        }
      }
    }

    if (this.filePathFlag) {
      this.filePathFlag.longFlag = this._makeFlag(
        this.filePathFlag.longFlag,
        'long'
      );
    }
    if (this.filePathFlag?.shortFlag) {
      this.filePathFlag.shortFlag = this._makeFlag(
        this.filePathFlag.shortFlag,
        'short'
      );
    }
  }

  private _makeFlag(flag: string, type: 'long' | 'short') {
    const prefix = type === 'long' ? '--' : '-';
    flag = flag.trim().replace(/^-+/, '');
    return `${prefix}${flag}`;
  }

  public get aliases() {
    return this._aliases;
  }
  public get options() {
    return this._opts;
  }

  public entries() {
    return this._opts.entries();
  }
}
