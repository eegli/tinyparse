import {
  AnyGlobal,
  CommandOptionsMap,
  FlagOptions,
  FlagValueRecord,
  MetaOptions,
} from './types';
import Utils from './utils';

export class HelpPrinter<O extends FlagValueRecord, G extends AnyGlobal> {
  #flagOptions: FlagOptions[];
  #commands: CommandOptionsMap<O, G>;
  #meta?: MetaOptions;
  #indent = '   ';

  constructor(
    meta: MetaOptions = {},
    flagOptions: FlagOptions[] = [],
    commands: CommandOptionsMap<O, G> = new Map(),
  ) {
    this.#meta = meta;
    this.#commands = commands;
    this.#flagOptions = this.#sortFlags(flagOptions);
  }

  #sortFlags(flags: FlagOptions[]) {
    const sortedFlags = flags.sort((a, b) => {
      const { required: aRequired, longFlag: aLongFlag } = a;
      const { required: bRequired, longFlag: bLongFlag } = b;
      // Sort according to required flags, then alphabetically
      if (aRequired && !bRequired) return -1;
      if (!aRequired && bRequired) return 1;
      if (aLongFlag < bLongFlag) return -1;
      if (aLongFlag > bLongFlag) return 1;
      // This never happens as longFlag is unique
      return 0;
    });

    return sortedFlags;
  }

  formatHeader() {
    let str = '';
    const summary = this.#meta?.summary;
    const appName = this.#meta?.appName;

    if (summary) str += `${summary}\n\n`;
    str += 'Usage:';
    if (appName) str += ` ${appName} [command] <...flags>`;
    return str;
  }

  formatCommands() {
    // Add commands
    const commands = [...this.#commands.entries()];
    if (commands.length === 0) return '';
    return commands.reduce((str, [cmd, { args, description }], i) => {
      const isLast = i === commands.length - 1;
      str += this.#indent + cmd;

      if (Array.isArray(args)) {
        str += ` ${args.map((a) => `<${a}>`).join(' ')}`;
      } else {
        str += ` <${args}>`;
      }
      if (description) {
        str += `\n${this.#indent}- ${description}`;
      }
      if (!isLast) str += '\n';
      return str;
    }, 'Commands\n');
  }
  formatFlags() {
    let str = '';
    const hasAnyRequiredFlag = this.#flagOptions.at(0)?.required;
    if (hasAnyRequiredFlag) str += 'Required flags\n';

    let insertOptionalFlagHeader = true;

    return this.#flagOptions.reduce((str, options, i) => {
      const { description, required, shortFlag, longFlag, defaultValue } =
        options;
      const isLast = i === this.#flagOptions.length - 1;
      if (!required && insertOptionalFlagHeader) {
        if (hasAnyRequiredFlag) str += '\n';
        str += 'Optional flags\n';
        insertOptionalFlagHeader = false;
      }
      str += this.#indent;
      if (shortFlag) str += `${shortFlag}, `;
      str += `${longFlag}`;
      str += ` [${Utils.typeof(defaultValue)}]`;
      if (description) {
        str += `\n${this.#indent}${description}`;
      }
      if (!isLast) str += '\n';
      return str;
    }, str);
  }

  formatHelpAndVersion() {
    const helpCommand = this.#meta?.helpCommand;
    const helpFlags = this.#meta?.helpFlags;
    if (!helpCommand && !helpFlags) return '';

    let str = 'For more information, ';
    if (helpCommand) str += `run ${helpCommand}`;
    if (helpFlags) {
      if (helpCommand) str += ' or ';
      str += `append ${Utils.joinStr(helpFlags, 'or')} to the command`;
    }
    return str;
  }

  print() {
    return [
      this.formatHeader(),
      this.formatCommands(),
      this.formatFlags(),
      this.formatHelpAndVersion(),
    ]
      .filter(Boolean)
      .join('\n\n');
  }
}
