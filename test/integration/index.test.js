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

  test('remove list', () => {
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

  test('error handler', () => {
    cli.run(['cp']);
    expectCalledTimes(errorSpy, 1);
    expectCalledWith(
      errorSpy,
      'Error parsing arguments. cp expects 2 arguments, got 0',
    );
  });

  test('default handler', () => {
    cli.run(['unknown']);
    expectCalledTimes(logSpy, 1);
    expectCalledWith(logSpy, 'No command specified');
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
