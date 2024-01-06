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
    fileExtensions: '',
    first: Infinity,
    ignoreFolders: false,
    afterDate: '',
  };
  const { parse } = createParser(defaultValues, {
    options: {
      fileExtensions: {
        required: true,
        longFlag: 'ext',
      },
      ignoreFolders: {
        shortFlag: 'i',
      },
      afterDate: {
        longFlag: 'after',
      },
    },
    positionals: {
      expect: [['copy', 'move'], null, null],
      caseSensitive: true,
    },
  });
  const parsed = await parse([
    'move', // Required positional argument, either 'copy' or 'move'
    'src/images', // Required positional argument, any value
    'dest/images', // Required positional argument, any value
    '--ext', // Custom long flag
    'jpg', // The value for "fileExtensions"
    '-i', // Custom short flag
    '--first', // Default long flag
    '10', // Will be parsed as number
    '--after', // Custom long flag
    '2018', // Will remain a string
  ]);

  assert.deepStrictEqual(parsed, {
    _: ['move', 'src/images', 'dest/images'],
    fileExtensions: 'jpg',
    ignoreFolders: true,
    first: 10,
    afterDate: '2018',
  });
});
