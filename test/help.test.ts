import { CommandBuilder } from '../src/commands';
import { HelpPrinter as Help } from '../src/help';
import {
  CommandOptionsMap,
  FlagOptions,
  FlagValue,
  HelpOptions,
  VersionOptions,
} from '../src/types/internals';

type Flag = [string, FlagOptions<FlagValue, boolean>];

describe('Helper text', () => {
  const _requiredflags: Flag[] = [
    [
      'auth',
      {
        longFlag: '--auth',
        defaultValue: '',
        required: true,
        description: 'Auth type to use',
        oneOf: ['basic', '2fa', 'oauth'],
      },
    ],
    [
      'before',
      {
        longFlag: '--before',
        defaultValue: new Date(),
        required: true,
      },
    ],
  ];
  const _optionalFlags: Flag[] = [
    [
      'port',
      {
        longFlag: '--port',
        defaultValue: 3000,
        description: 'Port to use',
      },
    ],
    [
      'verbose',
      {
        longFlag: '--verbose',
        shortFlag: '-v',
        defaultValue: false,
      },
    ],
    [
      'after',
      {
        longFlag: '--after',
        defaultValue: new Date(),
        oneOf: ["'2021-01-01'"],
        description: 'After date',
      },
    ],
    [
      'output',
      {
        longFlag: '--output',
        oneOf: ['yaml'],
        defaultValue: 'json',
        description: 'Output format',
      },
    ],
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
  const optionalFlags = new Map(_optionalFlags);
  const requiredflags = new Map(_requiredflags);
  const allFlags = new Map([...requiredflags, ...optionalFlags]);
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
         --auth <2fa|basic|oauth>   Auth type to use
         --before [date]            "
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
         --after [date]            After date
         --output <json|yaml>      Output format
         --port [number]           Port to use
         -v, --verbose [boolean]   
         --help                    Print this help message"
    `);
  });
  test('required and optional flags formatting', () => {
    expect(
      new Help({
        options: allFlags,
      }).formatOptions(),
    ).toMatchInlineSnapshot(`
      "Required flags
         --auth <2fa|basic|oauth>   Auth type to use
         --before [date]            

      Optional flags
         --after [date]             After date
         --output <json|yaml>       Output format
         --port [number]            Port to use
         -v, --verbose [boolean]    "
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
         --auth <2fa|basic|oauth>   Auth type to use
         --before [date]            

      Optional flags
         --after [date]             After date
         --output <json|yaml>       Output format
         --port [number]            Port to use
         -v, --verbose [boolean]    
         -h, --help                 Print this help message
         -v, --version              Print the version"
    `);
  });
});
