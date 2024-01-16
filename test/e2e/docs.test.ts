import { Parser } from '../../src';
import { CommandHandler } from '../../src/types';

const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

afterEach(() => {
  logSpy.mockClear();
});

test('readme', () => {
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
  expect(logSpy).toHaveBeenCalledWith('Happy birthday, John!');
});

test('quickstart', () => {
  const parser = new Parser()
    .option('verbose', {
      longFlag: '--verbose',
      shortFlag: '-v',
      defaultValue: false,
    })
    .globals((options) => ({
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
  expect(logSpy).toHaveBeenCalledWith('Hello, John!');
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
    .globals((options) => ({
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
