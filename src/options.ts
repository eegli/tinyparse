import decamelize from './decamelize';
import {
  ArgOptions,
  FilePathFlag,
  GlobalOptions,
  InternalOptions,
} from './types';

export class Options {
  private readonly _opts: InternalOptions = new Map();
  public readonly shouldDecamelize: boolean;
  public readonly filePathFlag: FilePathFlag | undefined;
  constructor(
    keyOptions: ArgOptions = {},
    keys: string[] = [],
    globalOptions: GlobalOptions = {}
  ) {
    for (const key of keys) {
      this._opts.set(key, keyOptions[key] || {});
    }
    this.shouldDecamelize = globalOptions.decamelize || false;
    this.filePathFlag = globalOptions.filePathFlag;
  }

  public get aliases(): Map<string, string> {
    const aliases = new Map<string, string>();
    for (const [key, opts] of this._opts) {
      if (opts.shortFlag) {
        aliases.set(opts.shortFlag, key);
      }
      if (this.shouldDecamelize) {
        aliases.set(decamelize(key, { separator: '-' }), key);
      }
    }
    return aliases;
  }
  public get options() {
    return this._opts;
  }
  public get(key: string) {
    if (!key) return this._opts;
    return this._opts.get(key) || {};
  }
  public values() {
    return this._opts.values();
  }
  public entries() {
    return this._opts.entries();
  }
}
