import assert from 'assert/strict';
import { after, afterEach, describe, mock, test } from 'node:test';
import * as cli from './cli.js';

describe('advanced example', () => {
  const originalLog = console.log;
  const originalError = console.error;
  const logSpy = mock.fn(console.log, () => {});
  const errorSpy = mock.fn(console.error, () => {});
  console.log = logSpy;
  console.error = errorSpy;

  after(() => {
    console.log = originalLog;
    console.error = originalError;
  });

  afterEach(() => {
    logSpy.mock.resetCalls();
    errorSpy.mock.resetCalls();
  });

  const expectCalledTimes = (mock, times) => {
    assert.deepEqual(mock.mock.calls.length, times);
  };

  const expectCalledWith = (mock, expected) => {
    assert.deepEqual(mock.mock.calls[0].arguments[0], expected);
  };

  const expectCalledWithMatch = (mock, expected) => {
    assert.match(mock.mock.calls[0].arguments[0], expected);
  };

  test('command copy', () => {
    cli.run(['cp', 'a', 'b', '-v']);
    expectCalledTimes(logSpy, 1);
    expectCalledWith(logSpy, 'Copying files from a to b');
  });

  test('command remove', () => {
    cli.run(['rm', 'a', 'b', 'c', '--ext=js,ts']);
    expectCalledTimes(logSpy, 1);
    expectCalledWith(
      logSpy,
      'Removing files a,b,c if they have extension js,ts',
    );
  });

  test('command status', () => {
    cli.run(['status']);
    expectCalledTimes(logSpy, 1);
    expectCalledWith(logSpy, 'Showing status for user: me');
  });

  test('command list 1', () => {
    cli.run(['ls']);
    expectCalledTimes(logSpy, 1);
    expectCalledWith(logSpy, 'Listing files in the current directory');
  });

  test('command list 2', () => {
    cli.run(['ls', 'my-folder/images']);
    expectCalledTimes(logSpy, 1);
    expectCalledWith(logSpy, 'Listing files in my-folder/images');
  });

  test('error handler', () => {
    cli.run(['cp']);
    expectCalledTimes(errorSpy, 1);
    expectCalledWith(errorSpy, 'Error: cp expects 2 arguments, got 0');
  });

  test('default handler', () => {
    cli.run(['cut']);
    expectCalledTimes(errorSpy, 1);
    expectCalledWith(errorSpy, 'Unknown command: cut');
    expectCalledTimes(logSpy, 1); // Usage
  });

  test('version', () => {
    for (const v of ['version', '-V', '--version']) {
      cli.run([v]);
      expectCalledTimes(logSpy, 1);
      expectCalledWith(logSpy, '1.0.0');
      logSpy.mock.resetCalls();
    }
  });
  test('help', () => {
    for (const v of ['help', '-h', '--help']) {
      cli.run([v]);
      expectCalledTimes(logSpy, 1);
      expectCalledWithMatch(logSpy, /Work with files and folders/);
      logSpy.mock.resetCalls();
    }
  });
});
