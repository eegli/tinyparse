import {
  AnyGlobal,
  CommandOptionsMap,
  FlagOptions,
  FlagValueRecord,
} from './types';
import Utils from './utils';

export class HelpPrinter<O extends FlagValueRecord, G extends AnyGlobal> {
  #options: FlagOptions[];
  #commands: CommandOptionsMap<O, G>;

  constructor(
    options: FlagOptions[] = [],
    commands: CommandOptionsMap<O, G> = new Map(),
  ) {
    this.#commands = commands;
    this.#options = this.sortFlags(options);
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
      return 0;
    });

    return sortedFlags;
  }

  public print() {
    const indent = '   ';
    let str = 'Usage';

    // Add commands
    const commandNames = [...this.#commands.keys()];

    if (commandNames.length > 0) {
      str += '\n\nAvailable commands\n';
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
    const hasAnyRequiredFlag = this.#options.at(0)?.required;
    if (hasAnyRequiredFlag) str += '\nRequired flags\n';

    let optionalFlag = true;

    for (const options of this.#options) {
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

    return str;
  }
}
