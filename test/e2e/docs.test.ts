import type { FlagValue, ParserOptions } from '../../src';
import { ValidationError, createParser } from '../../src';
import { mockFs } from '../_setup';

describe('command line options', () => {
  test('command arguments', () => {
    const { parseSync } = createParser({});
    const positionals = parseSync(['hello-world'])._;
    expect(positionals).toStrictEqual(['hello-world']);
  });
  test('flag arguments', async () => {
    const { parse } = createParser({ hello: 'world' });
    let parsed = await parse();
    expect(parsed).toStrictEqual({ _: [], hello: 'world' });

    parsed = await parse(['--hello', 'john']);
    expect(parsed).toStrictEqual({ _: [], hello: 'john' });
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

    positionals = parseSync(['unknown'])._; // Unknown subcommands fall through
    expect(positionals).toStrictEqual(['unknown']);

    positionals = parseSync(['status'])._;
    expect(positionals).toStrictEqual(['status']);

    positionals = parseSync(['copy', 'src', 'dest'])._;
    expect(positionals).toStrictEqual(['copy', 'src', 'dest']);

    positionals = parseSync(['remove', 'file1', 'file2', 'file3'])._;
    expect(positionals).toStrictEqual(['remove', 'file1', 'file2', 'file3']);

    expect(() => {
      parseSync(['copy', 'src']);
    }).toThrow("Invalid usage of command 'copy'. Too few arguments");

    expect(() => {
      parseSync(['status', 'noooop']);
    }).toThrow("Invalid usage of command 'status'. Too many arguments");
  });
});

describe('required arguments', () => {
  test('default', () => {
    const { parseSync } = createParser(
      { userName: '' },
      {
        options: {
          userName: {
            required: true,
          },
        },
        decamelize: true,
      },
    );

    expect(() => {
      parseSync(); // Whoops, forgot username!
    }).toThrow(new ValidationError('Missing required option --user-name'));
  });
});

describe('custom flags', () => {
  test('default', async () => {
    const { parse } = createParser(
      {
        userName: '',
        favoriteColor: '',
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
        decamelize: true,
      },
    );
    const parsed = await parse(['-v', '--user=john', '--favorite-color=red']);
    expect(parsed.verbose).toBe(true);
    expect(parsed.userName).toBe('john');
    expect(parsed.favoriteColor).toBe('red');
  });
});

describe('custom validation', () => {
  test('default', () => {
    const { parseSync } = createParser(
      { birthDate: '2000-01-01' },
      {
        options: {
          birthDate: {
            longFlag: 'bday',
            customValidator: {
              isValid(value): value is FlagValue {
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
});

describe('decamelize variabes', () => {
  test('default', async () => {
    const { parse } = createParser(
      { userName: '' },
      {
        decamelize: true,
      },
    );
    const parsed = await parse(['--user-name', 'eegli']);

    expect(parsed.userName).toBe('eegli');
  });
});

describe('reading files', () => {
  test('valid', () => {
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
  test('invalid', () => {
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
});

describe('printing arguments', () => {
  test('without decamelization', () => {
    const { help } = createParser(
      {
        verbose: false,
        authMethod: '',
      },
      {
        decamelize: true,
        options: {
          authMethod: {
            description: 'GitHub authentication method',
            required: true,
          },
          verbose: {
            shortFlag: 'v',
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
         --auth-method [string]
         GitHub authentication method

      Optional flags
         -v, --verbose [boolean]

         --config [string]
         Path to your Github config file
      "
    `);
  });

  test('with decamelization', () => {
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
});

describe('error handling', () => {
  test('rejects missing required', () => {
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
    }).toThrow(new ValidationError('Missing required option --username'));
  });
  test('rejects invalid types', () => {
    const { parseSync } = createParser({ age: 0 });

    expect(() => {
      parseSync(['--age']);
    }).toThrow(
      new ValidationError('Invalid type for --age. "true" is not a number'),
    );
  });
});

describe('typescript', () => {
  // eslint-disable-next-line jest/expect-expect
  test('bootstrapping', () => {
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
