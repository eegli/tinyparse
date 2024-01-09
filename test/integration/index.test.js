import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { run } from './cli.js';

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
test('advanced example', async () => {
  const exampleArgs = [
    'status',
    'cp src dest -v',
    'ls folder --ext=js,ts',
    'rm file1 file2 file3 file4',
    '--help',
    'unknown',
    '',
  ];
  const outputs = [
    /^Showing status/,
    /^Copying src to dest/,
    /^Listing folder/,
    /^Removing file1, file2, file3, file4/,
    /^Usage/,
    /^Error: Unknown command/,
    /^Usage/,
  ];
  for (let i = 0; i < exampleArgs.length; i++) {
    const args = exampleArgs[i];
    const output = outputs[i];
    const result = run(args.split(' '));
    assert.match(result, output);
  }
});
