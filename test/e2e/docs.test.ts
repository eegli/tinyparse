import type { ParserOptions, Value } from '../../src';
import { ValidationError, createParser } from '../../src';
import { mockFs } from '../_setup';

describe('command line options', () => {
  test('keeps defaults', async () => {
    const { parse } = createParser({ hello: 'world' });
    let parsed = await parse();
    expect(parsed).toStrictEqual({ _: [], hello: 'world' });

    parsed = await parse(['--hello', 'john']);
    expect(parsed).toStrictEqual({ _: [], hello: 'john' });
  });
  test('internal validation', () => {
    expect(() => {
      createParser(
        { a: '', b: '' },
        { options: { a: { shortFlag: 'a' }, b: { shortFlag: 'a' } } },
      );
    }).toThrow(
      'Parser config validation error, conflicting short flag: -a has been declared twice. Check your settings for short flags.',
    );
  });
  test('command arguments', () => {
    const { parseSync } = createParser({});
    const positionals = parseSync(['hello-world'])._;
    expect(positionals).toStrictEqual(['hello-world']);
  });
  test('cli arguments, boolean flags 1', async () => {
    const { parse } = createParser({ verbose: false });
    const parsed = await parse(['--verbose']);
    expect(parsed.verbose).toBe(true);
    expect(parsed).toStrictEqual({ verbose: true, _: [] });
  });
  test('cli arguments, boolean flags 2', async () => {
    const { parse } = createParser({ verbose: true });
    const parsed = await parse(['--verbose']);
    expect(parsed.verbose).toBe(true);
  });
  test('cli arguments, number conversion', async () => {
    const { parse } = createParser({
      limit: Infinity, // expect number
      year: '2000', // expect (date) string
    });
    const parsed = await parse(['--limit', '8', '--year', '2023']);
    expect(parsed.limit).toBe(8);
    expect(parsed.year).toBe('2023');
  });
});

describe('subcommands', () => {
  test('cli arguments, command arguments advanced', () => {
    const { parseSync } = createParser(
      {},
      {
        subcommands: {
          status: {
            args: [],
            description: 'Show status',
          },
          copy: {
            args: ['src', 'dest'],
            description: 'Copy files from source to destination',
          },
          remove: {
            args: 'files',
            description: 'Remove multiple files',
          },
        } as const,
      },
    );

    let positionals = parseSync([])._; // No subcommand, no problemo
    expect(positionals).toStrictEqual([]);

    positionals = parseSync(['status'])._;
    expect(positionals).toStrictEqual(['status']);

    positionals = parseSync(['copy', 'src', 'dest'])._;
    expect(positionals).toStrictEqual(['copy', 'src', 'dest']);

    positionals = parseSync(['remove', 'file1', 'file2', 'file3'])._;
    expect(positionals).toStrictEqual(['remove', 'file1', 'file2', 'file3']);

    expect(() => {
      parseSync(['cd', 'my-app']);
    }).toThrow("Unknown command 'cd'");

    expect(() => {
      parseSync(['copy', 'src']);
    }).toThrow("Invalid usage of command 'copy'. Too few arguments");

    expect(() => {
      parseSync(['status', 'noooop']);
    }).toThrow("Invalid usage of command 'status'. Too many arguments");
  });
});

describe('todo', () => {
  test('custom flags', async () => {
    const { parse } = createParser(
      {
        userName: '',
        verbose: false,
      },
      {
        options: {
          userName: {
            longFlag: 'user',
          },
          verbose: {
            shortFlag: 'v',
          },
        },
      },
    );
    const parsed = await parse(['-v', '--user=john']);
    expect(parsed.verbose).toBe(true);
    expect(parsed.userName).toBe('john');
  });

  test('custom validation', () => {
    const { parseSync } = createParser(
      { birthDate: '2000-01-01' },
      {
        options: {
          birthDate: {
            longFlag: 'bday',
            customValidator: {
              isValid(value): value is Value {
                if (typeof value !== 'string') return false;
                return !isNaN(new Date(value).getTime());
              },
              errorMessage(value, flag) {
                return `Invalid value '${value}' for option '${flag}'. Expected a valid date string`;
              },
            },
          },
        },
      },
    );
    // Valid date string
    expect(() => {
      parseSync(['--bday', '2000-01-01']);
    }).toBeTruthy();

    // What a weird month...
    expect(() => {
      parseSync(['--bday', '2000-22']);
    }).toThrow(
      "Invalid value '2000-22' for option '--bday'. Expected a valid date string",
    );
  });

  test('decamelization', async () => {
    const { parse } = createParser(
      { userName: '' },
      {
        decamelize: true,
      },
    );
    const parsed = await parse(['--user-name', 'eegli']);

    expect(parsed.userName).toBe('eegli');
  });

  test('file reading, valid', () => {
    const file = {
      userName: 'eegli',
      hasGitHubPlus: true,
    };
    mockFs.readFileSync.mockImplementationOnce((path) => {
      if (path === 'github.json') {
        return JSON.stringify(file);
      }
      throw new Error();
    });
    const { parseSync } = createParser(
      {
        userName: '',
        hasGitHubPlus: false,
      },
      {
        filePathArg: {
          longFlag: 'config',
          shortFlag: 'c',
          description: 'Path to your Github config file',
        },
      },
    );

    const parsed = parseSync(['-c', 'github.json']);

    expect(parsed.userName).toBe('eegli');
    expect(parsed.hasGitHubPlus).toBe(true);
  });
  test('file reading, invalid', () => {
    const file = {
      userName: {
        name: 'eegli',
      },
    };
    mockFs.readFileSync.mockImplementationOnce((path) => {
      if (path === 'bad-github.json') {
        return JSON.stringify(file);
      }
      throw new Error();
    });
    const { parseSync } = createParser(
      {
        userName: '',
      },
      {
        filePathArg: {
          longFlag: 'config',
        },
      },
    );

    expect(() => {
      parseSync(['--config', 'bad-github.json']);
    }).toThrow(`Invalid type for userName. "[object Object]" is not a string`);
  });
  test('printing args, without decamelization', () => {
    const { help } = createParser(
      {
        age: Infinity,
        hasGithubProfile: false,
      },
      {
        options: {
          hasGithubProfile: {
            description: 'Indicate whether you have a Github profile',
          },
          age: {
            shortFlag: 'a',
            required: true,
          },
        },
        subcommands: {
          login: {
            args: ['username'],
            description: 'Login to Github',
          },
          logout: {
            args: [],
            description: 'Logout from Github',
          },
        },
        filePathArg: {
          longFlag: 'config',
          description: 'Path to your Github config file',
        },
      },
    );
    const helpText = help({
      title: 'CLI usage',
      base: 'You can use this CLI to do various things',
    });
    expect(helpText).toMatchInlineSnapshot(`
      "CLI usage

      You can use this CLI to do various things

      Available commands
         login <username>
         - Login to Github
         logout 
         - Logout from Github

      Required flags
         -a, --age [number]

      Optional flags
         --hasGithubProfile [boolean]
         Indicate whether you have a Github profile

         --config [string]
         Path to your Github config file
      "
    `);
  });

  test('printing args, with decamelization', () => {
    const { help } = createParser(
      {
        userName: '',
      },
      {
        decamelize: true,
      },
    );
    const helpText = help();
    expect(helpText).toMatchInlineSnapshot(`
      "Usage

      Optional flags
         --user-name [string]"
    `);
  });

  test('error handling, rejects for missing args', () => {
    const { parseSync } = createParser(
      { username: '' },
      {
        options: {
          username: {
            required: true,
          },
        },
      },
    );

    expect(() => {
      parseSync(); // Whoops, forgot username!
    }).toThrow(new ValidationError('Missing required argument username'));
  });
  test('error handling, rejects invalid types', () => {
    const { parseSync } = createParser({ age: 0 });

    expect(() => {
      parseSync(['--age']);
    }).toThrow(
      new ValidationError('Invalid type for --age. "true" is not a number'),
    );
  });
  // eslint-disable-next-line jest/expect-expect
  test('typescript, bootstrapping', () => {
    const defaults = {
      abc: 'abc',
    };

    type CustomOptions = ParserOptions<typeof defaults>;

    // Construct the options for a parser...
    const options: CustomOptions = {
      options: {
        abc: {
          /* ... */
        },
      },
    };
    // ...and bootstrap it later
    createParser(defaults, options);
  });
});
