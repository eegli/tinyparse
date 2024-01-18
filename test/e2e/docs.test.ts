import type { CommandHandler, GlobalSetter } from '../../src';
import { Parser } from '../../src';

/* eslint-disable @typescript-eslint/no-unused-vars */

const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

afterEach(() => {
  consoleLog.mockClear();
});

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
        callDatabase: (name: string) => `Hello, ${name}!`,
        log: (message: string) => {
          if (options.verbose) {
            console.log(message);
          }
        },
      }))
      .subcommand('fetch-user', {
        args: ['user-name'] as const,
        handler: ({ args, globals }) => {
          const [userName] = args;
          const result = globals.callDatabase(userName);
          globals.log(result);
        },
      })
      .defaultHandler(({ globals }) => {
        globals.log('No command specified');
      });

    parser.parse(['fetch-user', 'John', '-v']).call();
    expect(consoleLog).toHaveBeenCalledWith('Hello, John!');
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
    }).toThrow('Missing required option --foo');

    expect(() => {
      parser.parse(['--foo', 'zero']).call();
    }).toThrow("Invalid type for --foo. 'zero' is not a valid number");

    expect(() => {
      parser.parse(['--foo', '12']).call();
    }).not.toThrow();
  });
  test('throws for double options', () => {
    expect(() => {
      new Parser()
        .option('foo', {
          longFlag: '--foo',
          defaultValue: '',
        })
        .option('foo', {
          longFlag: '--bar',
          defaultValue: '',
        });
    }).toThrow('Option foo has been declared twice');
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
    const options = new Parser().option('verbose', {
      longFlag: '--verbose',
      defaultValue: false,
    });

    const globalSetter: GlobalSetter<typeof options> = (options) => ({
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
      .subcommand('cmd-one', {
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
      parser.parse(['cmd-one']).call();
    }).toThrow('cmd-one expects 1 argument, got 0');
    expect(() => {
      parser.parse(['cmd-none-strict', 'hello']).call();
    }).toThrow('cmd-none-strict expects 0 arguments, got 1');
  });

  test('external declaration', () => {
    const subcommandHandler: CommandHandler<typeof options, [string]> = (
      params,
    ) => {
      const { args, options, globals } = params;
      const [userName] = args;
      let greeting = `Greetings from ${globals.fromUser} to ${userName}!`;

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
        args: ['from'] as const,
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
    }) => {
      console.log({ args, globals, options });
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
    });
  });
});
