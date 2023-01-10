import decamelize from './lib/decamelize';
import { FilePathFlag, InternalOptions, ParserParams } from './types';

export class Options {
  private readonly _opts: InternalOptions = new Map();
  private readonly _aliases: Map<string, string> = new Map();

  public readonly shouldDecamelize: boolean;
  public readonly filePathFlag: FilePathFlag | undefined;

  constructor(keys: string[], params: ParserParams = {}) {
    for (const key of keys) {
      this._opts.set(key, params.options?.[key] || {});
    }
    this.shouldDecamelize = params.decamelize || false;
    this.filePathFlag = params.filePathFlag;

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
