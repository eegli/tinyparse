import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

process.argv.push('-gp', '--config', 'github.json');

describe('Integration and docs', () => {
  test('full example', async () => {
    // Default values. They will be used as defaults/fallback
    const defaultValues = {
      username: '',
      birthday: '',
      hasGithubProfile: false,
    };

    const { help, parse } = createParser(
      defaultValues,
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
            description: 'Your Github username',
          },
          birthday: {
            // A custom validator that will receive the value for
            // "birthday". It must return a boolean
            customValidator: {
              isValid: (value) =>
                typeof value === 'string' && !isNaN(Date.parse(value)),
              // The error message for when validation fails
              errorMessage: (v) => `${v} is not a valid date`,
            },
          },
          hasGithubProfile: {
            description: 'Indicate whether you have a Github profile',
            // Short flag alias. Only takes effect when parsing an
            // array of strings
            shortFlag: '-gp',
          },
        },
      }
    );
    const parsedObj = await parse({
      username: 'feegli',
      birthday: '1996-01-01',
    });
    assert.deepStrictEqual(parsedObj, {
      username: 'feegli',
      birthday: '1996-01-01',
      hasGithubProfile: false,
    });

    // process.argv = ['arg0','arg1', '-gp', '--config', 'github.json']
    // Read from file "github.json" with content {"username": "eegli"}
    const parsedArgv = await parse([
      'arg0',
      'arg1',
      '-gp',
      '--config',
      'github.json',
    ]);
    assert.deepStrictEqual(parsedArgv, {
      username: 'eegli',
      birthday: '',
      hasGithubProfile: true,
    });

    console.log(help());
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
        hasGithubProfile: false,
        hasGithubPlus: true,
        followerCount: 0,
        birthDay: '',
      },
      {
        options: {
          followerCount: { shortFlag: '-fc' },
          birthDay: { skipParseInt: true },
        },
      }
    );
    const parsed = await parse([
      '--hasGithubProfile',
      '--hasGithubPlus',
      '-fc',
      '10',
      '--birthDay',
      '2018',
    ]);
    assert.deepStrictEqual(parsed, {
      hasGithubPlus: true,
      hasGithubProfile: true,
      followerCount: 10,
      birthDay: '2018',
    });
  });
});
