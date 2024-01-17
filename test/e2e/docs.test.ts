import { Parser } from '../../src';
import { CommandHandler } from '../../src/types';

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

test('todo, docs', () => {
  const handleBar: CommandHandler<typeof commands, [string]> = (params) => {
    expect(params.args).toEqual(['barArg']);
    expect(params.options.foo).toBe('fooValue');
    expect(params.globals.database).toBe('db');
    expect(params.globals.fooGlobal).toBe('fooValue');
  };

  const commands = new Parser()
    .option('foo', {
      longFlag: '--foo',
      defaultValue: 'fooDefault',
    })
    .setGlobals((options) => ({
      fooGlobal: options.foo,
      database: 'db',
    }));

  commands
    .subcommand('bar', {
      args: ['arg1'] as const,
      handler: handleBar,
    })
    .defaultHandler()
    .parse(['bar', 'barArg1', '--foo', 'fooValue']);
});
