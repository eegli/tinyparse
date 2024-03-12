import type {
  ErrorParams,
  InferOptions,
  WithArgs,
  WithGlobals,
  WithOptions,
} from '../../src';
import { Parser } from '../../src';

/* eslint-disable @typescript-eslint/no-unused-vars */

const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

afterEach(() => {
  consoleLog.mockClear();
});

describe('docs', () => {
  describe('readme', () => {
    test('default example', async () => {
      await new Parser()
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
    test('default example', async () => {
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
        .defaultHandler(() => {
          console.log('No command specified');
        });

      await parser.parse(['fetch-user', 'John', '-v']).call();
      expect(consoleLog).toHaveBeenLastCalledWith('Hello, John Smith!');

      await parser.parse([]).call();
      expect(consoleLog).toHaveBeenCalledWith(
        expect.stringMatching(/^No command specified/),
      );

      await parser.parse(['--help']).call();
      expect(consoleLog.mock.lastCall).toMatchInlineSnapshot(`
        [
          "A brief description of my-cli

        Usage: my-cli [command?] <...flags>

        Commands
           fetch-user <user-name>   
           help                     Print this help message
           version                  Print the version

        Optional flags
           -v, --verbose [boolean]   
           --help                    Print this help message
           --version                 Print the version",
        ]
      `);
    });
  });
  describe('options', () => {
    test('throws for incorrect types or missing', async () => {
      const parser = new Parser()
        .option('foo', {
          longFlag: '--foo',
          shortFlag: '-f',
          defaultValue: 0,
          required: true,
          oneOf: [0, 1],
          description: 'Foo option',
        })
        .defaultHandler();
      await expect(parser.parse([]).call()).rejects.toThrow(
        'Missing required option --foo',
      );
      await expect(parser.parse(['--foo', 'zero']).call()).rejects.toThrow(
        "Invalid type for --foo. 'zero' is not a valid number",
      );
      // Ok - "1" can be parsed as a number
      await expect(parser.parse(['--foo', '1']).call()).resolves.not.toThrow();
    });
    test('option access', () => {
      expect(
        new Parser()
          .option('foo', {
            longFlag: '--foo',
            defaultValue: 'abc',
          })
          .defaultHandler().options,
      ).toEqual({ foo: 'abc' });
    });
    test('boolean options', async () => {
      const parser = new Parser()
        .option('foo', {
          longFlag: '--foo',
          defaultValue: true,
          required: true,
        })
        .defaultHandler();

      const inputs: string[][] = [
        ['--foo'], // true
        ['--foo=true'], // true
        ['--foo', 'true'], // true
        ['--foo=false'], // false
        ['--foo', 'false'], // false
      ];

      for (const input of inputs) {
        await expect(parser.parse(input).call()).resolves.not.toThrow();
      }
    });
    test('constrained options', async () => {
      const parser = new Parser()
        .option('output', {
          longFlag: '--output',
          defaultValue: 'json',
          oneOf: ['yaml'],
        })
        .defaultHandler(({ options }) => {
          // Type: "json" | "yaml"
          console.log(options.output);
        });
      await expect(
        parser.parse(['--output', 'yaml']).call(),
      ).resolves.not.toThrow();
      await expect(
        parser.parse(['--output', 'json']).call(),
      ).resolves.not.toThrow();
      await expect(parser.parse(['--output', 'csv']).call()).rejects.toThrow(
        'Invalid value "csv" for option --output, expected one of: json, yaml',
      );
      await expect(
        new Parser()
          .option('output', {
            longFlag: '--output',
            defaultValue: 'json',
            required: true,
            oneOf: ['yaml'],
          })
          .defaultHandler(({ options }) => {
            // Type: "yaml"
            console.log(options.output);
          })
          .parse(['--output', 'json'])
          .call(),
      ).rejects.toThrow(
        'Invalid value "json" for option --output, expected one of: yaml',
      );
    });
  });
  describe('globals', () => {
    test('default', async () => {
      const globals = {
        database: (name: string) => name,
      };

      await new Parser()
        .setGlobals(() => globals)
        .defaultHandler(({ globals }) => {
          const user = globals.database('John');
          console.log(`Hello, ${user}!`);
        })
        .parse([])
        .call();

      expect(consoleLog).toHaveBeenCalledWith('Hello, John!');
    });
    test('external declaration', async () => {
      const parserOptions = new Parser().option('verbose', {
        longFlag: '--verbose',
        defaultValue: false,
      });

      type Options = InferOptions<typeof parserOptions>;

      const globalSetter = (options: Options) => ({
        log: (message: string) => {
          // Strong typing!
          if (options.verbose) {
            console.log(message);
          }
        },
      });
      const parser = parserOptions.setGlobals(globalSetter).defaultHandler();
      await expect(
        parser.parse(['do-a-thing', '--verbose']).call(),
      ).resolves.toBeUndefined();
    });
  });
  describe('subcommands', () => {
    test('default', async () => {
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

      let args = ['cmd-one-strict'];
      await expect(parser.parse(args).call()).rejects.toThrow(
        'cmd-one-strict expects 1 argument, got 0',
      );

      args = ['cmd-none-strict', 'hello'];
      await expect(parser.parse(args).call()).rejects.toThrow(
        'cmd-none-strict expects 0 arguments, got 1',
      );
    });

    test('external declaration', async () => {
      type BaseParser = typeof baseParser;

      const baseParser = new Parser()
        .option('uppercase', {
          longFlag: '--uppercase',
          shortFlag: '-u',
          defaultValue: false,
        })
        .setGlobals(() => ({
          flower: '🌸',
        }));

      type Params = WithArgs<[string, string]> &
        WithOptions<BaseParser> &
        WithGlobals<BaseParser>;

      const subcommandHandler = (params: Params) => {
        const { args, options, globals } = params;
        const [fromUser, toUser] = args;
        let greeting = `${globals.flower} from ${fromUser} to ${toUser}!`;

        if (options.uppercase) {
          greeting = greeting.toUpperCase();
        }
        console.log(greeting);
      };

      const parser = baseParser
        .subcommand('flowers', {
          args: ['from', 'to'] as const,
          handler: subcommandHandler,
        })
        .defaultHandler();

      await parser.parse(['flowers', 'John', 'Mary']).call();
      expect(consoleLog).toHaveBeenCalledWith('🌸 from John to Mary!');

      await parser.parse(['flowers', 'John', 'Mary', '-u']).call();
      expect(consoleLog).toHaveBeenCalledWith('🌸 FROM JOHN TO MARY!');
    });
  });
  describe('handlers', () => {
    test('default', async () => {
      await expect(
        new Parser().defaultHandler().parse([]).call(),
      ).resolves.not.toThrow();
    });

    test('external declaration', async () => {
      // Type alias for the future
      type BaseParser = typeof baseParser;

      // Set up the base parser with globals and options
      const baseParser = new Parser()
        .option('foo', {
          longFlag: '--foo',
          defaultValue: 'default',
        })
        .setGlobals(() => ({
          bar: 'baz',
        }));

      // I only need an array of strings
      type FirstHandler = WithArgs<string[]>;

      const firstHandler = ({ args }: FirstHandler) => {};

      // I need a tuple of two strings, the options, and the globals
      type SecondHandler = WithArgs<[string, string]> &
        WithOptions<BaseParser> &
        WithGlobals<BaseParser>;

      const secondHandler = ({ args, options, globals }: SecondHandler) => {};

      // I have no strict requirements but I need access to the options and globals
      type DefaultHandler = WithArgs<string[]> &
        WithGlobals<BaseParser> &
        WithOptions<BaseParser>;

      const defaultHandler = ({ args, globals, options }: DefaultHandler) => {
        console.log({ args, globals, options });
      };

      const parser = baseParser
        .subcommand('first', {
          // An array of strings is fine
          args: 'args',
          handler: firstHandler,
        })
        .subcommand('second', {
          // Match the type signature
          args: ['arg1', 'arg2'] as const,
          handler: secondHandler,
        })
        .defaultHandler(defaultHandler);

      await parser.parse(['hello', 'world']).call();

      expect(consoleLog).toHaveBeenCalledWith({
        args: ['hello', 'world'],
        globals: {
          bar: 'baz',
        },
        options: {
          foo: 'default',
        },
      });
    });
  });
  describe('subparsers', () => {
    test('default', async () => {
      const subparser = new Parser()
        .option('greeting', {
          longFlag: '--greeting',
          shortFlag: '-g',
          defaultValue: '',
        })
        .defaultHandler(({ options }) => {
          console.log(options.greeting);
        });

      const parser = new Parser()
        .option('greeting', {
          longFlag: '--greeting',
          shortFlag: '-g',
          defaultValue: '',
        })
        .subparser('v2', {
          parser: subparser,
          description: 'Version 2 of this CLI',
        })
        .defaultHandler(({ options }) => {
          console.log(options.greeting);
        });

      await parser.parse(['-g', 'hello from the main parser']).call();
      expect(consoleLog).toHaveBeenLastCalledWith('hello from the main parser');

      await parser.parse(['v2', '-g', 'hello from the subparser']).call();
      expect(consoleLog).toHaveBeenLastCalledWith('hello from the subparser');
    });
  });
  describe('help and meta', () => {
    test('calls help printer', async () => {
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
        .option('verbose', {
          longFlag: '--verbose',
          shortFlag: '-v',
          defaultValue: false,
          description: 'Enable verbose mode',
        })
        .option('outdir', {
          longFlag: '--out',
          defaultValue: '',
          required: true,
          description: 'Output directory',
        })
        .subcommand('fetch', {
          args: ['url'] as const,
          handler: () => {},
          description: 'Fetch a URL and save the html',
        })
        .subparser('afetch', {
          parser: new Parser().defaultHandler(),
          description: 'Fetch a URL with more options',
        })
        .defaultHandler();

      await parser.parse(['help']).call();
      await parser.parse(['--help']).call();
      await parser.parse(['-h']).call();

      expect(consoleLog).toHaveBeenCalledTimes(3);

      const firstHelpMessage = consoleLog.mock.calls[0][0];
      const secondHelpMessage = consoleLog.mock.calls[1][0];
      const thirdHelpMessage = consoleLog.mock.calls[2][0];

      expect(firstHelpMessage).toEqual(secondHelpMessage);
      expect(secondHelpMessage).toEqual(thirdHelpMessage);

      expect(firstHelpMessage).toMatchInlineSnapshot(`
        "A brief description of my-cli

        Usage: my-cli [command?] <...flags>

        Commands
           afetch        Fetch a URL with more options
           fetch <url>   Fetch a URL and save the html
           help          Print this help message

        Required flags
           --out [string]            Output directory

        Optional flags
           -v, --verbose [boolean]   Enable verbose mode
           -h, --help                Print this help message
           -V, --version             Print the version"
      `);
    });
    test('displays version', async () => {
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

      await parser.parse(['version']).call();
      await parser.parse(['--version']).call();
      await parser.parse(['-V']).call();

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
    test('catches error', async () => {
      const errorHandler = ({ error, usage }: ErrorParams) => {
        console.log(error.message);
        // Missing required option --foo
        console.log(usage);
        // Usage: ...
      };

      await new Parser()
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
  describe('async', () => {
    /* eslint-disable require-await */
    test('async', async () => {
      const consoleLog = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      const parser = new Parser()
        .option('token', {
          longFlag: '--token',
          required: true,
          defaultValue: '',
        })
        .setGlobals(async ({ token }) => {
          // Use the token to establish a connection
          return { database: async (name: string) => name };
        })
        .defaultHandler(async ({ args, globals }) => {
          const user = await globals.database(args[0]);
          console.log(`Hello, ${user}!`);
        })
        .parse(['John', '--token', '123']);

      await parser.call();

      expect(consoleLog).toHaveBeenCalledWith('Hello, John!');
    });
  });
});
