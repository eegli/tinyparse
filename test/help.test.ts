import { HelpPrinter as Help } from '../src/help';
import {
  CommandOptionsMap,
  FlagOptions,
  HelpOptions,
  VersionOptions,
} from '../src/types';

describe('Helper text', () => {
  const requiredflags: FlagOptions[] = [
    {
      longFlag: '--flag-a',
      defaultValue: '',
      required: true,
      description: 'The first flag',
    },

    {
      longFlag: '--flag-b',
      defaultValue: new Date(),
      required: true,
    },
  ];
  const optionalFlags: FlagOptions[] = [
    {
      longFlag: '--flag-d',
      shortFlag: '-d',
      defaultValue: 3000,
      description: 'The fourth flag',
    },
    {
      longFlag: '--flag-c',
      shortFlag: '-c',
      defaultValue: false,
    },
  ];
  const commands: CommandOptionsMap = new Map([
    [
      'serve',
      {
        args: ['path'],
        description: 'Serve a directory',
        handler: () => {},
      },
    ],
    [
      'info',
      {
        args: [],
        handler: () => {},
      },
    ],
    [
      'rm',
      {
        args: '...files',
        description: 'Remove files',
        handler: () => {},
      },
    ],
    [
      'ls',
      {
        args: undefined,
        description: 'List a directory',
        handler: () => {},
      },
    ],
  ]);

  const help: HelpOptions = {
    command: 'help',
    longFlag: '--help',
    shortFlag: '-h',
  };

  const version: VersionOptions = {
    command: 'version',
    version: '1.0.0',
    longFlag: '--version',
    shortFlag: '-v',
  };
  const appName = 'my-app';
  const summary = 'This is just a text that can be shown to describe the app';

  test('header formatting', () => {
    expect(new Help({ summary, appName }).formatHeader())
      .toMatchInlineSnapshot(`
      "This is just a text that can be shown to describe the app

      Usage: my-app [command] <...flags>"
    `);
    expect(new Help({ appName }).formatHeader()).toMatchInlineSnapshot(
      `"Usage: my-app [command] <...flags>"`,
    );
    expect(new Help({ summary }).formatHeader()).toMatchInlineSnapshot(`
      "This is just a text that can be shown to describe the app

      Usage:"
    `);
    expect(new Help().formatHeader()).toMatchInlineSnapshot(`"Usage:"`);
  });
  test('commands formatting', () => {
    expect(new Help({}, [], commands).formatCommands()).toMatchInlineSnapshot(`
      "Commands
         serve <path>
         - Serve a directory
         info 
         rm <...files>
         - Remove files
         ls
         - List a directory"
    `);
  });
  test('required flags formatting', () => {
    const p = new Help({}, requiredflags, new Map());
    expect(p.formatFlags()).toMatchInlineSnapshot(`
      "Required flags
         --flag-a [string]
         The first flag
         --flag-b [date]"
    `);
  });
  test('optional flags formatting', () => {
    expect(
      new Help(
        {
          help: {
            longFlag: '--help',
          },
        },
        optionalFlags,
        new Map(),
      ).formatFlags(),
    ).toMatchInlineSnapshot(`
      "Optional flags
         -c, --flag-c [boolean]
         -d, --flag-d [number]
         The fourth flag
         --help
         Print this help message"
    `);
  });
  test('required and optional flags formatting', () => {
    expect(
      new Help(
        {},
        [...requiredflags, ...optionalFlags],
        new Map(),
      ).formatFlags(),
    ).toMatchInlineSnapshot(`
      "Required flags
         --flag-a [string]
         The first flag
         --flag-b [date]

      Optional flags
         -c, --flag-c [boolean]
         -d, --flag-d [number]
         The fourth flag"
    `);
  });

  test('no configuration', () => {
    expect(new Help().print()).toMatchInlineSnapshot(`"Usage:"`);
  });
  test('full configuration', () => {
    expect(
      new Help(
        {
          appName,
          summary,
          help,
          version,
        },
        [...requiredflags, ...optionalFlags],
        commands,
      ).print(),
    ).toMatchInlineSnapshot(`
      "This is just a text that can be shown to describe the app

      Usage: my-app [command] <...flags>

      Commands
         serve <path>
         - Serve a directory
         info 
         rm <...files>
         - Remove files
         ls
         - List a directory
         help
         - Print this help message
         version
         - Print the version

      Required flags
         --flag-a [string]
         The first flag
         --flag-b [date]

      Optional flags
         -c, --flag-c [boolean]
         -d, --flag-d [number]
         The fourth flag
         -h, --help
         Print this help message
         -v, --version
         Print the version"
    `);
  });
});
