import {
  AnyGlobal,
  CommandOptionsMap,
  FlagOptions,
  FlagValueRecord,
  HelpOptions,
} from './types';
import Utils from './utils';

export class HelpPrinter<O extends FlagValueRecord, G extends AnyGlobal> {
  #flagOptions: FlagOptions[];
  #commands: CommandOptionsMap<O, G>;

  constructor(
    flagOptions: FlagOptions[] = [],
    commands: CommandOptionsMap<O, G> = new Map(),
  ) {
    this.#commands = commands;
    this.#flagOptions = this.sortFlags(flagOptions);
  }

  private sortFlags(flags: FlagOptions[]) {
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

  public print(options: Partial<HelpOptions>) {
    const indent = '   ';
    let str = '';

    if (options.summary) {
      str += `${options.summary}\n\n`;
    }

    if (options.appName) {
      str += `Usage: ${options.appName} [command] <...flags>\n`;
    }

    // Add commands
    const commandNames = [...this.#commands.keys()];

    if (commandNames.length > 0) {
      str += '\nCommands\n';
      for (const command of commandNames) {
        const { args, description } = this.#commands.get(command)!;

        str += indent;
        str += `${command}`;
        if (Array.isArray(args)) {
          str += ` ${args.map((a) => `<${a}>`).join(' ')}`;
        } else {
          str += ` <${args}>`;
        }
        if (description) {
          str += `\n${indent}- ${description}\n`;
        } else {
          str += '\n';
        }
      }
    }

    // Maybe no option is required
    const hasAnyRequiredFlag = this.#flagOptions.at(0)?.required;
    if (hasAnyRequiredFlag) str += '\nRequired flags\n';

    let optionalFlag = true;

    for (const options of this.#flagOptions) {
      const { description, required, shortFlag, longFlag, defaultValue } =
        options;

      if (optionalFlag && !required) {
        str += '\nOptional flags\n';
        optionalFlag = false;
      }

      str += indent;
      if (shortFlag) str += `${shortFlag}, `;
      str += `${longFlag}`;
      str += ` [${Utils.typeof(defaultValue)}]`;
      if (description) {
        str += `\n${indent}${description}\n`;
      } else {
        str += '\n';
      }
    }

    if (options.appName && options.command) {
      str += `\nTo view this help message, run "${options.appName} ${options.command}"`;
    }

    if (options.flags && options.flags.length > 0) {
      str += ` or add ${Utils.joinStr(options.flags, 'or')} to any command`;
    }

    return str;
  }
}
