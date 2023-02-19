import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';
import { test } from 'node:test';

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

  const { parse, parseSync } = createParser(defaultValues);

  const parsed1 = await parse({ username: 'eegli', active: true });
  const parsed2 = parseSync(['hello', '--username', 'eegli', '--active']);

  assert.deepStrictEqual(parsed1, {
    username: 'eegli',
    active: true,
  });
  assert.deepStrictEqual(parsed2, {
    username: 'eegli',
    active: true,
    _: ['hello'],
  });
});

test('e2e', async () => {
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
          required: true,
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
