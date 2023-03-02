import { FlagOption, ParserOptions, PrimitiveRecord } from './types';
import Utils from './utils';

export class Options {
  public readonly aliases: Map<string, string> = new Map();
  public readonly flagOptions: Map<string, FlagOption> = new Map();

  public readonly filePathFlags = new Set<string>();
  public readonly filePathFlagDesc?: string;

  constructor(defaults: PrimitiveRecord = {}, options: ParserOptions = {}) {
    const { longFlag, shortFlag } = options.filePathArg ?? {};

    this.filePathFlagDesc = options.filePathArg?.description;
    if (longFlag) {
      this.filePathFlags.add(Utils.makeLongFlag(longFlag));
    }
    if (shortFlag) {
      this.filePathFlags.add(Utils.makeShortFlag(shortFlag));
    }

    // Merge option keys/flags with user-provided options
    for (const [key, value] of Object.entries(defaults)) {
      const userOptions = options.options?.[key] ?? {};
      const isRequired = !!userOptions.required;

      let longFlag = key;
      if (userOptions.longFlag) {
        longFlag = userOptions.longFlag;
      } else if (options.decamelize) {
        // Only decamelize if no custom long flag is provided AND
        // decamelize is enabled
        longFlag = Utils.decamelize(key);
      }

      longFlag = Utils.makeLongFlag(longFlag);
      this._addAlias(longFlag, 'long', key);

      // Short flags should be short, hence no decamelization
      let shortFlag: string | undefined;
      if (userOptions.shortFlag) {
        shortFlag = Utils.makeShortFlag(userOptions.shortFlag);
        this._addAlias(shortFlag, 'short', key);
      }

      this.flagOptions.set(key, {
        longFlag,
        shortFlag,
        isRequired,
        validator: userOptions.customValidator,
        description: userOptions.description,
        value,
      });
    }
  }

  private _addAlias(alias: string, flagType: 'long' | 'short', forKey: string) {
    // At this point, all file flags have been set
    const existingFilePathFlag = this.filePathFlags.has(alias);
    if (existingFilePathFlag) {
      throw new Error(
        `Conflicting flag: ${alias} has already been declared as a file path flag`
      );
    }

    const existingAlias = this.aliases.get(alias);
    if (existingAlias) {
      let text = `conflicting long flag: ${alias} has been declared twice`;
      let cause = 'custom long flags and decamelization';
      if (flagType === 'short') {
        cause = 'short flags';
        text = `conflicting short flag: ${alias} has been declared twice`;
      }

      throw new Error(
        `Parser config validation error, ${text}. Check your settings for ${cause}.`
      );
    }

    this.aliases.set(alias, forKey);
  }
}
