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

  const parsed1 = await parse(['hello', '--username', 'john', '--active']);
  const parsed2 = parseSync(['hello', '--username=john', '--active']);

  assert.deepStrictEqual(parsed1, parsed2);

  assert.deepStrictEqual(parsed1, {
    username: 'john',
    active: true,
    _: ['hello'],
  });
});

test('quickstart advanced example', async () => {
  const defaultValues = {
    to: '',
    from: '',
    hasGithubProfile: false,
    hasGithubPlus: true,
    followerCount: 0,
    birthYear: '',
    unchanged: 'unchanged',
  };
  const { parse } = createParser(defaultValues, {
    options: {
      followerCount: {
        required: true,
        shortFlag: '-fc',
      },
      hasGithubProfile: {
        longFlag: 'github',
      },
    },
  });
  const parsed = await parse([
    'congratulations', // Positional argument
    '--to', // Long flag
    'John', // Long flag value
    '--from=Anna', // Equal sign instead of space
    '--github', // Custom long boolean flag
    '--hasGithubPlus', // Another boolean flag
    '-fc', // Custom short flag
    '10', // Will be parsed as number
    'ignoredProperty', // This property is ignored
    '--birthYear', // Long flag
    '2018', // Will remain a string
  ]);

  assert.deepStrictEqual(parsed, {
    _: ['congratulations'],
    to: 'John',
    from: 'Anna',
    hasGithubPlus: true,
    hasGithubProfile: true,
    followerCount: 10,
    birthYear: '2018',
    unchanged: 'unchanged',
  });
});
