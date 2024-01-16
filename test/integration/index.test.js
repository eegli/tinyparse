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

  test('command copy', (t) => {
    cli.run(['cp', 'a', 'b', '-v']);
    expectCalledTimes(logSpy, 1);
    expectCalledWith(logSpy, 'Copying files from a to b');
  });

  test('command list', (t) => {
    cli.run(['ls', 'myfolder', '--ext=js,ts']);
    expectCalledTimes(logSpy, 1);
    expectCalledWith(
      logSpy,
      'Listing files in myfolder with extension js or ts',
    );
  });

  test('remove list', (t) => {
    cli.run(['rm', 'a', 'b', 'c']);
    expectCalledTimes(logSpy, 1);
    expectCalledWith(logSpy, 'Removing files a,b,c');
  });

  test('command status', (t) => {
    cli.run(['status']);
    expectCalledTimes(logSpy, 1);
    expectCalledWith(logSpy, 'Showing status for user: me');
  });

  test('error handler', (t) => {
    cli.run(['ls']);
    expectCalledTimes(errorSpy, 1);
    expectCalledWith(
      errorSpy,
      'Error parsing arguments. Received: ls. ls expects 1 argument, got 0',
    );
  });
});
