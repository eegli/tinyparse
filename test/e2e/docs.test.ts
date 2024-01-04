import type { ParserOptions, Value } from '../../src';
import { createParser, ValidationError } from '../../src';
import { mockFs } from '../_setup';

describe('Docs', () => {
  test('cli arguments, keeps defaults', async () => {
    const { parse } = createParser({ hello: 'world' });
    let parsed = await parse();
    expect(parsed).toStrictEqual({ _: [], hello: 'world' });

    parsed = await parse(['--hello', 'john']);
    expect(parsed).toStrictEqual({ _: [], hello: 'john' });
  });
  test('cli arguments, internal validation', () => {
    expect(() => {
      createParser(
        { a: '', b: '' },
        { options: { a: { shortFlag: 'a' }, b: { shortFlag: 'a' } } },
      );
    }).toThrow(
      'Parser config validation error, conflicting short flag: -a has been declared twice. Check your settings for short flags.',
    );
  });
  test('cli arguments, positional arguments 1', async () => {
    const { parse } = createParser({});
    const parsed = await parse(['hello-world']);
    expect(parsed).toStrictEqual({ _: ['hello-world'] });
  });

  test('cli arguments, positional arguments 2', () => {
    const { parseSync } = createParser(
      {},
      {
        positionals: {
          count: '=0', // Allow no positional arguments
        },
      },
    );
    expect(() => {
      parseSync(['hello-world']);
    }).toThrow('Invalid number of positional arguments: Expected 0, got 1');
  });

  test('cli arguments, positional arguments 3', () => {
    const { parseSync } = createParser(
      {},
      {
        positionals: {
          count: '>=1', // Require 1 or more positional arguments
        },
      },
    );
    expect(() => {
      parseSync([]);
    }).toThrow(
      'Invalid number of positional arguments: Expected at least 1, got 0',
    );
  });

  test('cli arguments, positional arguments 4', () => {
    const { parseSync } = createParser(
      {},
      {
        positionals: {
          count: '<=1', // Require 1 or less positional arguments
        },
      },
    );
    expect(() => {
      parseSync(['a', 'b']);
    }).toThrow(
      'Invalid number of positional arguments: Expected at most 1, got 2',
    );
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
      followers: -1, // expect number
      year: '2000', // expect (date) string
    });
    const parsed = await parse(['--followers', '8', '--year', '2023']);
    expect(parsed.followers).toBe(8);
    expect(parsed.year).toBe('2023');
  });

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
        userName: '',
        age: Infinity,
        hasGithubProfile: false,
      },
      {
        options: {
          userName: {
            shortFlag: 'u',
            description: 'Your GitHub username',
          },
          hasGithubProfile: {
            description: 'Indicate whether you have a Github profile',
          },
          age: {
            required: true,
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
      base: 'my-cli <message> [flags]',
    });
    expect(helpText).toMatchInlineSnapshot(`
      "CLI usage

      my-cli <message> [flags]

      Required flags
         --age [number]

      Optional flags
         --hasGithubProfile [boolean]
         Indicate whether you have a Github profile

         -u, --userName [string]
         Your GitHub username

         --config [string]
         Path to your Github config file
      "
    `);
  });

  test('printing args, with decamelization', () => {
    const { help } = createParser(
      {
        userName: '',
        hasGithubProfile: false,
      },
      {
        decamelize: true,
        options: {
          userName: {
            longFlag: 'user',
          },
        },
      },
    );
    const helpText = help();
    expect(helpText).toMatchInlineSnapshot(`
      "Usage

      Optional flags
         --has-github-profile [boolean]

         --user [string]"
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
