import { HelpPrinterConfig } from './config';
import {
  AnyGlobal,
  CommandOptionsMap,
  FlagOptions,
  FlagOptionsMap,
  FlagValueRecord,
  MetaOptions,
  SubparserOptionsMap,
} from './types';
import Utils from './utils';

type CommandOptions = {
  command: string;
  args: string[] | string | undefined;
  description?: string;
};

export class HelpPrinter<O extends FlagValueRecord, G extends AnyGlobal> {
  #requiredOptions: FlagOptions[];
  #optionalOptions: FlagOptions[];
  #commands: CommandOptions[];
  #meta?: MetaOptions;
  #indent = ' '.repeat(3);
  #extraPadding = ' '.repeat(3);

  constructor({
    meta,
    commands = new Map(),
    options = new Map(),
    parsers = new Map(),
  }: HelpPrinterConfig<O, G> = {}) {
    this.#meta = meta;
    const [requiredOptions, optionalOptions] = this.#transformOptions(options);
    this.#requiredOptions = requiredOptions;
    this.#optionalOptions = optionalOptions;
    this.#commands = this.#transformCommands(commands, parsers);
    this.#addHelpAndVersionInfo(meta);
  }

  #transformCommands(
    subcommands: CommandOptionsMap<O, G>,
    parsers: SubparserOptionsMap,
  ) {
    const commands = [...subcommands.entries()].reduce(
      (acc, [command, { args, description }]) => {
        acc.push({
          command,
          args,
          description,
        });
        return acc;
      },
      [] as CommandOptions[],
    );
    const withParsers = [...parsers.entries()].reduce(
      (acc, [command, { description }]) => {
        acc.push({
          command,
          description,
          args: undefined,
        });
        return acc;
      },
      commands,
    );

    return withParsers.sort((a, b) => {
      if (a.command < b.command) return -1;
      if (a.command > b.command) return 1;
      return 0;
    });
  }
  #addHelpAndVersionInfo(meta?: MetaOptions) {
    if (meta?.help?.command) {
      this.#commands.push({
        command: meta.help.command,
        args: undefined,
        description: 'Print this help message',
      });
    }
    if (meta?.version?.command) {
      this.#commands.push({
        command: meta.version.command,
        args: undefined,
        description: 'Print the version',
      });
    }

    if (meta?.help?.longFlag) {
      this.#optionalOptions.push({
        longFlag: meta.help.longFlag,
        shortFlag: meta.help?.shortFlag,
        defaultValue: false,
        description: 'Print this help message',
      });
    }

    if (meta?.version?.longFlag) {
      this.#optionalOptions.push({
        longFlag: meta.version.longFlag,
        shortFlag: meta.version?.shortFlag,
        defaultValue: false,
        description: 'Print the version',
      });
    }
  }

  #transformOptions(options: FlagOptionsMap) {
    const sortedOptions = [...options.values()].sort((a, b) => {
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

    return sortedOptions.reduce(
      (acc, option) => {
        if (option.required) {
          acc[0].push(option);
        } else {
          acc[1].push(option);
        }
        return acc;
      },
      [[], []] as [FlagOptions[], FlagOptions[]],
    );
  }

  formatHeader() {
    const summary = this.#meta?.summary;
    const command = this.#meta?.command;

    let str = summary ? `${summary}\n\nUsage:` : 'Usage:';
    if (command) str += ` ${command} [command?] <...flags>`;
    return str;
  }

  formatCommands() {
    if (this.#commands.length === 0) return '';
    const commands = this.#commands.reduce(
      (acc, { command, args, description }) => {
        let str = command;

        if (Array.isArray(args)) {
          str += ` ${args.map((a) => `<${a}>`).join(' ')}`;
        } else if (args) {
          str += ` <${args}>`;
        }

        acc.push([str, description || '']);
        return acc;
      },
      [] as [string, string][],
    );
    const maxLen = this.#maxStrLen(commands, 0);
    const commandsWithDescription = commands.map(([c, d]) =>
      this.#addDescription(c, d, maxLen),
    );
    return 'Commands\n' + commandsWithDescription.join('\n');
  }

  formatOptions() {
    const required = this.#formatOptionWithArgs(this.#requiredOptions);
    const optional = this.#formatOptionWithArgs(this.#optionalOptions);

    const maxOptionLen = this.#maxStrLen(required.concat(optional), 0);

    const requiredWithDescription = required.map(([key, desc]) =>
      this.#addDescription(key, desc, maxOptionLen),
    );
    const optionalWithDescription = optional.map(([key, desc]) =>
      this.#addDescription(key, desc, maxOptionLen),
    );

    let options =
      requiredWithDescription.length > 0
        ? 'Required flags\n' + requiredWithDescription.join('\n')
        : '';

    if (options.length > 0 && optionalWithDescription.length > 0) {
      options += '\n\n';
    }
    if (optionalWithDescription.length > 0) {
      options += 'Optional flags\n' + optionalWithDescription.join('\n');
    }
    return options;
  }

  #formatOptionWithArgs(options: FlagOptions[]): [string, string][] {
    return options.reduce(
      (acc, options) => {
        const { shortFlag, longFlag, defaultValue } = options;

        let str = shortFlag ? `${shortFlag}, ${longFlag}` : longFlag;

        // Help and version flags have no value
        if (
          longFlag !== this.#meta?.help?.longFlag &&
          longFlag !== this.#meta?.version?.longFlag
        ) {
          str += ` [${Utils.typeof(defaultValue)}]`;
        }

        acc.push([str, options.description || '']);
        return acc;
      },
      [] as [string, string][],
    );
  }
  #addDescription(key: string, description: string, maxLen: number) {
    const padding = ' '.repeat(maxLen - key.length) + this.#extraPadding;
    return `${this.#indent}${key}${padding}${description}`;
  }
  #maxStrLen = (arr: string[][], idx: number) =>
    Math.max(...arr.map((s) => s[idx].length), 0);

  printUsage() {
    return [this.formatHeader(), this.formatCommands(), this.formatOptions()]
      .filter(Boolean)
      .join('\n\n');
  }
}
