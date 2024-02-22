import { HelpPrinter as Help } from '../src/help';
import { CommandOptionsMap, FlagOptions } from '../src/types';

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
  ]);

  const helpCommand = 'help';
  const helpFlags = ['--help1', '--help2', '-h'];
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
         - Remove files"
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
    const p = new Help({}, optionalFlags, new Map());
    expect(p.formatFlags()).toMatchInlineSnapshot(`
      "Optional flags
         -c, --flag-c [boolean]
         -d, --flag-d [number]
         The fourth flag"
    `);
  });
  test('required and optional flags formatting', () => {
    const p = new Help({}, [...requiredflags, ...optionalFlags], new Map());
    expect(p.formatFlags()).toMatchInlineSnapshot(`
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
  test('help and version formatting', () => {
    expect(
      new Help({ helpCommand }, [], new Map()).formatHelpAndVersion(),
    ).toMatchInlineSnapshot(`"For more information, run help"`);
    expect(
      new Help({ helpFlags }, [], new Map()).formatHelpAndVersion(),
    ).toMatchInlineSnapshot(
      `"For more information, append --help1, --help2 or -h to the command"`,
    );
    expect(
      new Help(
        { helpCommand, helpFlags },
        [],
        new Map(),
      ).formatHelpAndVersion(),
    ).toMatchInlineSnapshot(
      `"For more information, run help or append --help1, --help2 or -h to the command"`,
    );
  });
  test('no configuration', () => {
    const printer = new Help();
    expect(printer.print()).toMatchInlineSnapshot(`"Usage:"`);
  });
  test('full configuration', () => {
    const printer = new Help(
      { appName, summary, helpCommand, helpFlags },
      [...requiredflags, ...optionalFlags],
      commands,
    );
    expect(printer.print()).toMatchInlineSnapshot(`
      "This is just a text that can be shown to describe the app

      Usage: my-app [command] <...flags>

      Commands
         serve <path>
         - Serve a directory
         info 
         rm <...files>
         - Remove files

      Required flags
         --flag-a [string]
         The first flag
         --flag-b [date]

      Optional flags
         -c, --flag-c [boolean]
         -d, --flag-d [number]
         The fourth flag

      For more information, run help or append --help1, --help2 or -h to the command"
    `);
  });
});
