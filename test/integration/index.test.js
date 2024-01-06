import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import cli from './cli.js';

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

test('cli example', () => {
  const argv = [
    'move',
    'src/images',
    'dest/images',
    '--ext',
    'jpg',
    '-i',
    '--first',
    '10',
    '--after',
    '2018',
  ];
  const received = cli(argv);

  const expected = `You want to:
  - move the first 10 files with extension jpg
  - from src/images
  - to dest/images
  - after 2018
  - and ignore any subfolders`;
  assert.strictEqual(received, expected);
});
