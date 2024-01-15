import { test } from 'node:test';
import { run } from './cli.js';

test('advanced example', async () => {
  new Proxy(globalThis.console, {
    get: function (target, prop, receiver) {
      process.stdout.write('console.log was called with:');

      return Reflect.get(target, prop, receiver);
    },
  });

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
    // assert.match(result, output);
  }
});
