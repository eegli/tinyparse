import { CommandBuilder } from '../src/commands';
import { HelpPrinter as Help } from '../src/help';
import {
  CommandOptionsMap,
  FlagOptionsMap,
  HelpOptions,
  VersionOptions,
} from '../src/types/internals';

describe('Helper text', () => {
  const requiredflags: FlagOptionsMap = new Map([
    [
      'flagA',
      {
        longFlag: '--flag-a',
        defaultValue: '',
        required: true,
        description: 'The first flag',
      },
    ],
    [
      'flabB',
      {
        longFlag: '--flag-b',
        defaultValue: new Date(),
        required: true,
      },
    ],
  ]);
  const optionalFlags: FlagOptionsMap = new Map([
    [
      'flagD',
      {
        longFlag: '--flag-d',
        shortFlag: '-d',
        defaultValue: 3000,
        description: 'The fourth flag',
      },
    ],
    [
      'flabC',
      {
        longFlag: '--flag-c',
        shortFlag: '-c',
        defaultValue: false,
      },
    ],
  ]);
  const allFlags = new Map([...requiredflags, ...optionalFlags]);
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
  const command = 'my-app';
  const summary = 'This is just a text that can be shown to describe the app';

  test('header formatting', () => {
    expect(new Help({ meta: { summary, command } }).formatHeader())
      .toMatchInlineSnapshot(`
      "This is just a text that can be shown to describe the app

      Usage: my-app [command?] <...flags>"
    `);
    expect(
      new Help({ meta: { command } }).formatHeader(),
    ).toMatchInlineSnapshot(`"Usage: my-app [command?] <...flags>"`);
    expect(new Help({ meta: { summary } }).formatHeader())
      .toMatchInlineSnapshot(`
      "This is just a text that can be shown to describe the app

      Usage:"
    `);
    expect(new Help().formatHeader()).toMatchInlineSnapshot(`"Usage:"`);
  });
  test('commands formatting', () => {
    expect(new Help({ commands }).formatCommands()).toMatchInlineSnapshot(`
      "Commands
         info            
         ls              List a directory
         rm <...files>   Remove files
         serve <path>    Serve a directory"
    `);
  });
  test('required flags formatting', () => {
    const p = new Help({ options: requiredflags });
    expect(p.formatOptions()).toMatchInlineSnapshot(`
      "Required flags
         --flag-a [string]   The first flag
         --flag-b [date]     "
    `);
  });
  test('optional flags formatting', () => {
    expect(
      new Help({
        meta: {
          help: {
            longFlag: '--help',
          },
        },
        options: optionalFlags,
      }).formatOptions(),
    ).toMatchInlineSnapshot(`
      "Optional flags
         -c, --flag-c [boolean]   
         -d, --flag-d [number]    The fourth flag
         --help                   Print this help message"
    `);
  });
  test('required and optional flags formatting', () => {
    expect(
      new Help({
        options: allFlags,
      }).formatOptions(),
    ).toMatchInlineSnapshot(`
      "Required flags
         --flag-a [string]        The first flag
         --flag-b [date]          

      Optional flags
         -c, --flag-c [boolean]   
         -d, --flag-d [number]    The fourth flag"
    `);
  });

  test('no configuration', () => {
    expect(new Help().printUsage()).toMatchInlineSnapshot(`"Usage:"`);
  });
  test('full configuration', () => {
    expect(
      new Help({
        meta: {
          command,
          summary,
          help,
          version,
        },
        options: allFlags,
        parsers: new Map([
          [
            'a-subparser',
            {
              parser: new CommandBuilder().defaultHandler(),
              description: 'Subparser description',
            },
          ],

          [
            'x-subparser',
            {
              parser: new CommandBuilder().defaultHandler(),
            },
          ],
        ]),

        commands,
      }).printUsage(),
    ).toMatchInlineSnapshot(`
      "This is just a text that can be shown to describe the app

      Usage: my-app [command?] <...flags>

      Commands
         a-subparser     Subparser description
         info            
         ls              List a directory
         rm <...files>   Remove files
         serve <path>    Serve a directory
         x-subparser     
         help            Print this help message
         version         Print the version

      Required flags
         --flag-a [string]        The first flag
         --flag-b [date]          

      Optional flags
         -c, --flag-c [boolean]   
         -d, --flag-d [number]    The fourth flag
         -h, --help               Print this help message
         -v, --version            Print the version"
    `);
  });
});
