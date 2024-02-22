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

    if (meta.help?.command) {
      this.#commands.set(meta.help.command, {
        args: undefined,
        handler: () => {},
        description: 'Print this help message',
      });
    }

    if (meta.version?.command) {
      this.#commands.set(meta.version.command, {
        args: undefined,
        handler: () => {},
        description: 'Print the version',
      });
    }

    if (meta.help?.longFlag) {
      this.#flagOptions.push({
        longFlag: meta.help.longFlag,
        shortFlag: meta.help?.shortFlag,
        defaultValue: false,
        description: 'Print this help message',
      });
    }

    if (meta.version?.longFlag) {
      this.#flagOptions.push({
        longFlag: meta.version.longFlag,
        shortFlag: meta.version?.shortFlag,
        defaultValue: false,
        description: 'Print the version',
      });
    }
  }

  #sortFlags(flags: FlagOptions[]) {
    const sortedFlags = [...flags].sort((a, b) => {
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
    const commands = [...this.#commands.entries()];
    if (commands.length === 0) return '';
    return commands.reduce((str, [cmd, { args, description }], i) => {
      const isLast = i === commands.length - 1;
      str += this.#indent + cmd;

      if (Array.isArray(args)) {
        str += ` ${args.map((a) => `<${a}>`).join(' ')}`;
      } else if (args) {
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
      // Help and version flags have no value
      if (
        longFlag !== this.#meta?.help?.longFlag &&
        longFlag !== this.#meta?.version?.longFlag
      ) {
        str += ` [${Utils.typeof(defaultValue)}]`;
      }
      if (description) {
        str += `\n${this.#indent}${description}`;
      }
      if (!isLast) str += '\n';
      return str;
    }, str);
  }

  print() {
    return [this.formatHeader(), this.formatCommands(), this.formatFlags()]
      .filter(Boolean)
      .join('\n\n');
  }
}
