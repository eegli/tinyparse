import decamelize from './lib/decamelize';
import { FilePathArg, InternalOptions, ParserParams } from './types';

export class Options {
  private readonly _opts: InternalOptions = new Map();
  private readonly _aliases: Map<string, string> = new Map();

  public readonly shouldDecamelize: boolean;
  public readonly filePathFlag?: FilePathArg;

  constructor(keys: string[], params: ParserParams = {}) {
    for (const key of keys) {
      this._opts.set(key, params.options?.[key] || {});
    }
    this.shouldDecamelize = params.decamelize || false;
    this.filePathFlag = params.filePathArg;

    for (const [key, opts] of this._opts) {
      if (opts.shortFlag) {
        this._aliases.set(opts.shortFlag, key);
      }
      if (this.shouldDecamelize) {
        const decamelized = decamelize(key, { separator: '-' });
        if (decamelized !== key) {
          this._aliases.set(decamelized, key);
        }
      }
    }
    this;
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
