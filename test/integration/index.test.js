import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

describe('Integration and docs', () => {
  test('simple example', async () => {
    const defaultValues = {
      username: '',
    };

    const { parse } = createParser(defaultValues);

    const parsed1 = await parse({ username: 'eegli' });
    const parsed2 = await parse(['--username', 'eegli']);

    assert.deepStrictEqual(parsed1, { username: 'eegli' });
    assert.deepStrictEqual(parsed2, { username: 'eegli' });
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
        // Parse a file (for example, a config file). Only takes
        // effect when parsing an array of strings
        filePathArg: {
          longFlag: '--config',
          description: 'Path to your Github config file',
        },
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
            shortFlag: '-ghp',
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

    // Read from file "github.json" with content {"username": "eegli"}
    process.argv = ['--age', '12', '-ghp', '--config', 'github.json'];

    const parsedArgv = await parse(process.argv);
    assert.deepStrictEqual(parsedArgv, {
      username: 'eegli',
      age: 12,
      hasGithubProfile: true,
    });
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
      '--name',
      '"Eric Egli"',
      '--hasGithubProfile',
      '--hasGithubPlus',
      '-fc',
      '10',
      '--birthYear',
      '2018',
    ]);
    assert.deepStrictEqual(parsed, {
      name: '"Eric Egli"',
      hasGithubPlus: true,
      hasGithubProfile: true,
      followerCount: 10,
      birthYear: '2018',
    });
  });
});
