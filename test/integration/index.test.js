import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

describe('Integration and docs', () => {
  test('landing page example', async () => {
    const { parse } = createParser({
      username: '',
    });

    const parsed = await parse(['hello', '--username', 'eegli']);

    assert.deepStrictEqual(parsed, { username: 'eegli', _: ['hello'] });
  });
  test('quickstart example', async () => {
    const defaultValues = {
      username: '',
      active: false,
    };

    const { parse } = createParser(defaultValues);

    const parsed1 = await parse({ username: 'eegli', active: true });
    const parsed2 = await parse(['--username', 'eegli', '--active']);

    assert.deepStrictEqual(parsed1, { username: 'eegli', active: true });
    assert.deepStrictEqual(parsed2, { username: 'eegli', active: true, _: [] });
  });

  test('full example', async () => {
    // Default values. They will be used as defaults/fallback
    const defaultUser = {
      username: '',
      age: 0,
      hasGithubProfile: false,
    };

    const { help, parse } = createParser(
      defaultUser,
      // More configuration
      {
        // Options per key
        options: {
          username: {
            // Fail if there is no value for "username"
            required: true,
            description: 'Your custom username',
          },
          age: {
            // A custom validator that will receive the value for
            // "age". It must return a boolean
            customValidator: {
              isValid: (value) => typeof value === 'number' && value > 0,
              // The error message for when validation fails
              errorMessage: (v) => `${v} is not a positive number`,
            },
          },
          hasGithubProfile: {
            description: 'Indicate whether you have a Github profile',
            // Short flag alias. Only takes effect when parsing an
            // array of strings
            shortFlag: 'ghp',
          },
        },
      }
    );

    // Some user input
    const userInput = {
      username: 'eegli',
      age: 12,
    };

    const parsedInput = await parse(userInput);

    assert.deepStrictEqual(parsedInput, {
      username: 'eegli',
      age: 12,
      hasGithubProfile: false,
    });

    process.argv = ['profile', '--username', 'eegli', '--age', '12', '-ghp'];

    const parsedArgv = await parse(process.argv);

    // When parsing an array of strings, positional arguments are
    // available on the _ property
    assert.deepStrictEqual(parsedArgv, {
      _: ['profile'],
      username: 'eegli',
      age: 12,
      hasGithubProfile: true,
    });

    // Print available options with descriptions. Optionally, set a
    // title and a base command showing the usage of positional
    // arguments. Everything else is auto-generated

    // prettier-ignore
    const helpCommand =
`CLI usage

my-cli <message> [flags]

Required flags
   --username [string]
   Your custom username

Optional flags
   --age [number]

   -ghp, --hasGithubProfile [boolean]
   Indicate whether you have a Github profile`;

    assert.strictEqual(
      help('CLI usage', 'my-cli <message> [flags]'),
      helpCommand
    );
    // console.log(help('CLI usage', 'my-cli <message> [flags]'));
  });
  test('invalid types example', async () => {
    const { parse } = createParser({ username: '' });
    await assert.rejects(
      async () => {
        // @ts-expect-error test input
        await parse({ username: ['eegli'] });
      },
      {
        name: 'ValidationError',
        message: 'Invalid type for "username". Expected string, got object',
      }
    );
  });
  test('process argv', async () => {
    const { parse } = createParser(
      {
        name: '',
        hasGithubProfile: false,
        hasGithubPlus: true,
        followerCount: 0,
        birthYear: '',
      },
      {
        options: {
          followerCount: {
            shortFlag: '-fc',
          },
        },
      }
    );
    const parsed = await parse([
      'congratulate', // Positional argument
      '--name',
      '"Eric Egli"', // Value with spaces
      '--hasGithubProfile', // Boolean flag
      '--hasGithubPlus',
      '-fc', // Short flag
      '10', // Will be parsed as number
      'ignoredProperty', // This property is ignored
      '--birthYear',
      '2018', // Will remain a string
    ]);

    assert.deepStrictEqual(parsed, {
      _: ['congratulate'],
      name: '"Eric Egli"',
      hasGithubPlus: true,
      hasGithubProfile: true,
      followerCount: 10,
      birthYear: '2018',
    });
  });
});
