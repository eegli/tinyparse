import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';
import test from 'node:test';

test('Integration and docs', async (t) => {
  await t.test('full example', async (t) => {
    // Default values. These will be used as defaults/fallback
    const defaultValues = {
      username: '',
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
            required: true,
            // For the help() command
            description: 'Your Github username',
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
    const parsedObj = await parse({ username: 'feegli' });
    assert.deepStrictEqual(parsedObj, {
      username: 'feegli',
      hasGithubProfile: false,
    });

    // Assuming there is a file "config.json"
    const parsedArgv = await parse(['-gp', '--config', 'file.json']);
    assert.deepStrictEqual(parsedArgv, {
      hasGithubProfile: true,
      username: 'eegli',
    });

    console.log(help());
  });
  await t.test('invalid types example', async () => {
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
  await t.test('process argv', async () => {
    const { parse } = createParser(
      {
        hasGithubProfile: false,
        hasGithubPlus: true,
        followerCount: 0,
      },
      { options: { followerCount: { shortFlag: '-fc' } } }
    );
    const parsed = await parse([
      '--hasGithubProfile',
      '--hasGithubPlus',
      '-fc',
      '10',
    ]);
    assert.deepStrictEqual(parsed, {
      hasGithubPlus: true,
      hasGithubProfile: true,
      followerCount: 10,
    });
  });
});
