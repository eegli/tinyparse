import type { CommandHandler, ErrorHandler, GlobalSetter } from '../../src';
import { Parser } from '../../src';

/* eslint-disable @typescript-eslint/no-unused-vars */

const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

afterEach(() => {
  consoleLog.mockClear();
});

describe('docs', () => {
  describe('readme', () => {
    test('default example', () => {
      new Parser()
        .option('occasion', {
          longFlag: '--occasion',
          shortFlag: '-o',
          defaultValue: '',
          required: true,
        })
        .subcommand('congratulate', {
          args: ['name'] as const,
          handler: ({ args, options }) => {
            const [name] = args;
            const { occasion } = options;
            console.log(`Happy ${occasion}, ${name}!`);
          },
        })
        .defaultHandler(() => {
          console.log('Please enter your name');
        })
        .parse(['congratulate', 'John', '--occasion', 'birthday'])
        .call();
      expect(consoleLog).toHaveBeenCalledWith('Happy birthday, John!');
    });
  });

  describe('quickstart', () => {
    test('default example', () => {
      const parser = new Parser()
        .option('verbose', {
          longFlag: '--verbose',
          shortFlag: '-v',
          defaultValue: false,
        })
        .setGlobals((options) => ({
          getUserFromDB: (name: string) => `${name} Smith`,
          log: (message: string) => {
            if (options.verbose) {
              console.log(message);
            }
          },
        }))
        .subcommand('fetch-user', {
          args: ['user-name'] as const,
          handler: ({ args, globals }) => {
            const [firstName] = args;
            const userName = globals.getUserFromDB(firstName);
            globals.log(`Hello, ${userName}!`);
          },
        })
        .setMeta({
          command: 'my-cli',
          summary: 'A brief description of my-cli',
          help: {
            command: 'help',
            longFlag: '--help',
          },
          version: {
            version: '1.0.0',
            command: 'version',
            longFlag: '--version',
          },
        })
        .defaultHandler(({ usage }) => {
          console.log('No command specified', '\n', usage);
        });

      parser.parse(['fetch-user', 'John', '-v']).call();
      expect(consoleLog).toHaveBeenLastCalledWith('Hello, John Smith!');

      parser.parse(['--help']).call();
      expect(consoleLog).toHaveBeenLastCalledWith(
        expect.stringMatching(/^A brief description of my-cli/),
      );
      parser.parse([]).call();
      expect(consoleLog).toHaveBeenLastCalledWith(
        expect.stringMatching(/^No command specified/),
        '\n',
        expect.any(String),
      );
    });
  });

  describe('options', () => {
    test('throws for incorrect types or missing', () => {
      const parser = new Parser()
        .option('foo', {
          longFlag: '--foo',
          shortFlag: '-f',
          defaultValue: 0,
          required: true,
          description: 'Foo option',
        })
        .defaultHandler();

      expect(() => {
        parser.parse([]).call();
      }).toThrow('Missing required option');

      expect(() => {
        parser.parse(['--foo', 'zero']).call();
      }).toThrow("Invalid type for --foo. 'zero' is not a valid number");

      expect(() => {
        parser.parse(['--foo', '12']).call();
      }).not.toThrow();
    });
    test('boolean options', () => {
      const parser = new Parser()
        .option('foo', {
          longFlag: '--foo',
          defaultValue: true,
          required: true,
        })
        .defaultHandler();

      const inputs: string[][] = [
        ['--foo'],
        ['--foo=true'],
        ['--foo', 'true'],
        ['--foo=false'],
        ['--foo', 'false'],
      ];
      for (const input of inputs) {
        expect(() => {
          parser.parse(input).call();
        }).not.toThrow();
      }
    });
  });

  describe('globals', () => {
    test('default', () => {
      const globals = {
        database: (name: string) => name,
      };

      new Parser()
        .setGlobals(() => globals)
        .defaultHandler(({ globals }) => {
          const user = globals.database('John');
          console.log(`Hello, ${user}!`);
        })
        .parse([])
        .call();

      expect(consoleLog).toHaveBeenCalledWith('Hello, John!');
    });
    test('external declaration', () => {
      type Options = typeof options;

      const options = new Parser().option('verbose', {
        longFlag: '--verbose',
        defaultValue: false,
      });

      const globalSetter: GlobalSetter<Options> = (options) => ({
        log: (message: string) => {
          if (options.verbose) {
            console.log(message);
          }
        },
      });
      const parser = options.setGlobals(globalSetter).defaultHandler();
      expect(parser.parse(['do-a-thing', '--verbose']).call()).toBeUndefined();
    });
  });

  describe('subcommands', () => {
    test('default', () => {
      const parser = new Parser()
        .subcommand('cmd-one-strict', {
          args: ['arg1'] as const, // expects exactly one argument (strict)
          handler: ({ args }) => {
            // Tuple-length is inferred
            const [arg1] = args;
          },
        })
        .subcommand('cmd-none-strict', {
          args: [], // expects no arguments (strict)
          handler: () => {},
        })

        .subcommand('cmd-all', {
          args: 'args', // expects any number of arguments (non-strict)
          handler: ({ args }) => {
            // string[] is inferred
            const [arg1, ...rest] = args;
          },
        })
        .subcommand('cmd-none', {
          args: undefined, // expects no arguments (non-strict)
          handler: ({ args }) => {
            // string[] is inferred
            const [arg1, ...rest] = args;
          },
        })
        .defaultHandler();

      expect(() => {
        parser.parse(['cmd-one-strict']).call();
      }).toThrow('cmd-one-strict expects 1 argument, got 0');
      expect(() => {
        parser.parse(['cmd-none-strict', 'hello']).call();
      }).toThrow('cmd-none-strict expects 0 arguments, got 1');
    });

    test('external declaration', () => {
      type Options = typeof options;

      const subcommandHandler: CommandHandler<Options, [string]> = (params) => {
        const { args, options, globals } = params;
        const [toUser] = args;
        let greeting = `Greetings from ${globals.fromUser} to ${toUser}!`;

        if (options.uppercase) {
          greeting = greeting.toUpperCase();
        }
        console.log(greeting);
      };

      const options = new Parser()
        .option('uppercase', {
          longFlag: '--uppercase',
          shortFlag: '-u',
          defaultValue: false,
        })
        .setGlobals(() => ({
          fromUser: 'John',
        }));

      const parser = options
        .subcommand('send-greeting', {
          args: ['to'] as const,
          handler: subcommandHandler,
        })
        .defaultHandler();

      parser.parse(['send-greeting', 'Mary']).call();
      expect(consoleLog).toHaveBeenCalledWith('Greetings from John to Mary!');
      parser.parse(['send-greeting', 'Mary', '-u']).call();
      expect(consoleLog).toHaveBeenCalledWith('GREETINGS FROM JOHN TO MARY!');
    });
  });

  describe('handlers', () => {
    test('default', () => {
      expect(() => {
        new Parser().defaultHandler().parse([]).call();
      }).not.toThrow();
    });

    test('default handler', () => {
      const options = new Parser();

      const defaultHandler: CommandHandler<typeof options> = ({
        args,
        globals,
        options,
        usage,
      }) => {
        console.log({ args, globals, options, usage });
      };

      const executeHandler = new Parser()
        .defaultHandler(defaultHandler)
        .parse(['hello', 'world']).call;

      // Time goes by...

      executeHandler();

      expect(consoleLog).toHaveBeenCalledWith({
        args: ['hello', 'world'],
        globals: {},
        options: {},
        usage: expect.any(String),
      });
    });
  });

  describe('subparsers', () => {
    test('default', () => {
      const subparser = new Parser()
        .setMeta({
          version: {
            version: '2.0.0',
            longFlag: '--version',
          },
        })
        .defaultHandler();

      const parser = new Parser()
        .subparser('v2', {
          parser: subparser,
          description: 'Version 2 of this CLI',
        })
        .setMeta({
          version: {
            version: '1.0.0',
            longFlag: '--version',
          },
        })
        .defaultHandler();

      parser.parse(['--version']).call();
      expect(consoleLog).toHaveBeenLastCalledWith('1.0.0');
      parser.parse(['v2', '--version']).call();
      expect(consoleLog).toHaveBeenLastCalledWith('2.0.0');
    });
  });

  describe('help and meta', () => {
    test('calls help printer', () => {
      const parser = new Parser()
        .setMeta({
          command: 'my-cli',
          summary: 'A brief description of my-cli',
          help: {
            command: 'help',
            longFlag: '--help',
            shortFlag: '-h',
          },
          version: {
            version: '1.0.0',
            longFlag: '--version',
            shortFlag: '-V',
          },
        })
        .option('foo', {
          longFlag: '--foo',
          shortFlag: '-f',
          required: true,
          defaultValue: '',
          description: 'Foo option',
        })
        .option('bar', {
          longFlag: '--bar',
          defaultValue: new Date(),
          description: 'Bar option',
        })
        .subcommand('baz', {
          args: ['arg'] as const,
          handler: () => {},
          description: 'Baz command',
        })
        .subparser('fuzz', {
          parser: new Parser().defaultHandler(),
          description: 'Fuzz command',
        })
        .defaultHandler();

      parser.parse(['help']).call();
      parser.parse(['--help']).call();
      parser.parse(['-h']).call();

      expect(consoleLog).toHaveBeenCalledTimes(3);

      const firstHelpMessage = consoleLog.mock.calls[0][0];
      const secondHelpMessage = consoleLog.mock.calls[1][0];
      const thirdHelpMessage = consoleLog.mock.calls[2][0];

      expect(firstHelpMessage).toEqual(secondHelpMessage);
      expect(secondHelpMessage).toEqual(thirdHelpMessage);

      expect(firstHelpMessage).toMatchInlineSnapshot(`
        "A brief description of my-cli

        Usage: my-cli [command] <...flags>

        Commands
           baz <arg>   Baz command
           fuzz        Fuzz command
           help        Print this help message

        Required flags
           -f, --foo [string]   Foo option

        Optional flags
           --bar [date]         Bar option
           -h, --help           Print this help message
           -V, --version        Print the version"
      `);
    });
    test('displays version', () => {
      const parser = new Parser()
        .setMeta({
          command: 'my-cli',
          summary: 'A brief description of my-cli',
          version: {
            version: '1.0.0',
            command: 'version',
            longFlag: '--version',
            shortFlag: '-V',
          },
        })
        .defaultHandler();

      parser.parse(['version']).call();
      parser.parse(['--version']).call();
      parser.parse(['-V']).call();

      expect(consoleLog).toHaveBeenCalledTimes(3);

      const firstVersionMessage = consoleLog.mock.calls[0][0];
      const secondVersionMessage = consoleLog.mock.calls[1][0];
      const thirdVersionMessage = consoleLog.mock.calls[2][0];

      expect(firstVersionMessage).toEqual(secondVersionMessage);
      expect(secondVersionMessage).toEqual(thirdVersionMessage);

      expect(firstVersionMessage).toBe('1.0.0');
    });
  });

  describe('error handling', () => {
    test('catches error', () => {
      const errorHandler: ErrorHandler = (error, usage) => {
        console.log(error.message);
        // Missing required option --foo
        console.log(usage);
        // Usage: ...
      };

      new Parser()
        .option('foo', {
          longFlag: '--foo',
          required: true,
          defaultValue: false,
        })
        .onError(errorHandler)
        .defaultHandler()
        .parse(['--bar'])
        .call();

      expect(consoleLog).toHaveBeenCalledTimes(2);
      expect(consoleLog.mock.calls).toMatchInlineSnapshot(`
        [
          [
            "Missing required option --foo",
          ],
          [
            "Usage:

        Required flags
           --foo [boolean]   ",
          ],
        ]
      `);
    });
  });
});
