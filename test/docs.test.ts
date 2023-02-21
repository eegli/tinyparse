import type { ParserOptions, Value } from '../src';
import { createParser, ValidationError } from '../src';

describe('Docs', () => {
  test('cli arguments, internal validation', () => {
    expect(() => {
      createParser(
        { a: '', b: '' },
        { options: { a: { shortFlag: 'a' }, b: { shortFlag: 'a' } } }
      );
    }).toThrow(
      'Parser config validation error, conflicting short flag: -a has been declared twice. Check your settings for short flags.'
    );
  });
  test('cli arguments, positional arguments', async () => {
    const { parse } = createParser({});
    const parsed = await parse(['hello-world']);
    expect(parsed).toStrictEqual({ _: ['hello-world'] });
  });
  test('cli arguments, boolean flags 1', async () => {
    const { parse } = createParser({
      verbose: false,
    });
    const parsed = await parse(['--verbose']);
    expect(parsed.verbose).toBe(true);
  });
  test('cli arguments, boolean flags 2', async () => {
    const { parse } = createParser({
      verbose: true,
    });
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
      }
    );
    const parsed = await parse(['-v', '--user', 'eegli']);
    expect(parsed.verbose).toBe(true);
    expect(parsed.userName).toBe('eegli');
  });

  test('custom validation', async () => {
    const { parse } = createParser(
      { birthDate: '2000-01-01' },
      {
        options: {
          birthDate: {
            customValidator: {
              isValid(value): value is Value {
                if (typeof value !== 'string') return false;
                return !isNaN(new Date(value).getTime());
              },
              errorMessage(value) {
                return `Invalid value '${value}' for option 'birthDate'. Expected a valid date string`;
              },
            },
          },
        },
      }
    );
    // Valid date string
    await expect(parse(['--birthDate', '2000-01-01'])).resolves.toBeTruthy();

    // What a weird month...
    await expect(parse(['--birthDate', '2000-22'])).rejects.toThrow();
  });

  test('decamelization', async () => {
    const { parse } = createParser(
      { userName: '' },
      {
        decamelize: true,
      }
    );
    const parsed = await parse(['--user-name', 'eegli']);

    expect(parsed.userName).toBe('eegli');
  });

  test('file reading', async () => {
    // FS mocks have been setup in ./test/_setup.ts

    /*
    Assume that there is a JSON file with the following content in the current directory:
    {
      username: 'eegli', hasGitHubPlus: false,
    }
    */

    const { parse } = createParser(
      {
        username: '',
        hasGitHubPlus: true,
      },
      {
        filePathArg: {
          longFlag: '--config',
          shortFlag: '-c',
          description: 'Path to your Github config file',
        },
      }
    );

    const parsed = await parse(['-c', 'github.json']);

    expect(parsed.username).toBe('eegli');
    expect(parsed.hasGitHubPlus).toBe(false);
  });
  test('printing args, without decamelization', () => {
    const { help } = createParser(
      {
        userName: '',
        age: -1,
        hasGithubProfile: false,
      },
      {
        options: {
          userName: {
            description: 'Your custom username',
          },
          hasGithubProfile: {
            description: 'Indicate whether you have a Github profile',
          },
          age: {
            required: true,
          },
        },
      }
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

         --userName [string]
         Your custom username"
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
      }
    );
    const helpText = help();
    expect(helpText).toMatchInlineSnapshot(`
      "Usage

      Optional flags
         --has-github-profile [boolean]

         --user [string]"
    `);
  });

  test('error handling, rejects for missing args', async () => {
    expect.assertions(1);
    const { parse } = createParser(
      { username: '' },
      {
        options: {
          username: {
            required: true,
          },
        },
      }
    );
    try {
      await parse(); // Whoops, forgot username!
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.message).toBe('Missing required flag --username');
      }
    }
  });
  test('error handling, rejects invalid types', async () => {
    expect.assertions(1);
    const { parse } = createParser({ age: 0 });
    try {
      const res = await parse(['--age']);
      console.log(res);
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.message).toBe(
          'Invalid type for --age. "true" is not a number'
        );
      }
    }
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
