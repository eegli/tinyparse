import decamelize from './lib/decamelize';
import { FilePathArg, InternalOptions, ParserParams } from './types';

export class Options {
  private readonly _opts: InternalOptions = new Map();
  private readonly _aliases: Map<string, string> = new Map();

  public readonly shouldDecamelize: boolean;
  public readonly filePathFlag?: FilePathArg;

  constructor(keys: string[], params: ParserParams = {}) {
    // Merge option keys/flags with user-provided options
    for (const key of keys) {
      this._opts.set(key, params.options?.[key] || {});
    }

    // Global options
    this.shouldDecamelize = !!params.decamelize;
    this.filePathFlag = params.filePathArg;

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

    // Create alias map
    for (const [key, opts] of this._opts) {
      if (opts.shortFlag) {
        const shortFlag = this._makeFlag(opts.shortFlag, 'short');
        this._aliases.set(shortFlag, key);
      }
      if (this.shouldDecamelize) {
        const decamelized = decamelize(key, { separator: '-' });
        if (decamelized !== key) {
          this._aliases.set(decamelized, key);
        }
      }
    }
  }

  private _makeFlag(flag: string, type: 'long' | 'short') {
    const prefix = type === 'long' ? '--' : '-';
    return flag.startsWith(prefix) ? flag : `${prefix}${flag}`;
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
