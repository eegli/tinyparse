import { CommandBuilder } from '../src/commands';
import { ValidationError } from '../src/error';
import { Parser } from '../src/parser';

const commandHandler = jest.fn();
const defaultHandler = jest.fn();
const defaultHandlerSubparser = jest.fn();
const errorHandler = jest.fn();

const subparser = new CommandBuilder().defaultHandler(defaultHandlerSubparser);

afterEach(() => {
  commandHandler.mockClear();
  defaultHandler.mockClear();
  errorHandler.mockClear();
});

const parser = new Parser({
  meta: {},
  options: new Map([['flag1', { defaultValue: 0, longFlag: '--flag1' }]]),
  commands: new Map([
    [
      'expect1',
      {
        args: ['arg1'] as const,
        handler: (params) => commandHandler(params),
      },
    ],
    [
      'expectAll',
      {
        args: 'all',
        handler: (params) => commandHandler(params),
      },
    ],
    [
      'expectNone',
      {
        args: [],
        handler: (params) => commandHandler(params),
      },
    ],
  ]),
  parsers: new Map([
    [
      'subparser',
      {
        parser: subparser,
      },
    ],
  ]),
  globalSetter: () => ({ database: 'db' }),
  defaultHandler,
  errorHandler,
});

const expectCalledWithDefaults = (mock: jest.Mock, args: string[]) => {
  expect(mock.mock.calls[0][0]).toEqual(
    expect.objectContaining({
      options: { flag1: 0 },
      globals: { database: 'db' },
      args,
      usage: expect.any(String),
    }),
  );
};

describe('parser', () => {
  test('returns callable', async () => {
    const { call } = parser.parse([]);
    await expect(call()).resolves.toBeUndefined();
  });
  test('calls default handler', async () => {
    await parser.parse([]).call();
    expect(defaultHandler).toHaveBeenCalledTimes(1);
    expectCalledWithDefaults(defaultHandler, []);
  });
  test('calls subparser', async () => {
    await parser.parse(['subparser']).call();
    expect(defaultHandlerSubparser).toHaveBeenCalledTimes(1);
  });
  test('calls default handler when no subcommand matches', async () => {
    await parser.parse(['a']).call();
    expect(defaultHandler).toHaveBeenCalledTimes(1);
    expectCalledWithDefaults(defaultHandler, ['a']);
    expect(commandHandler).not.toHaveBeenCalled();
  });
  test('calls subcommand with fixed args', async () => {
    await parser.parse(['expect1', 'b']).call();
    expect(defaultHandler).not.toHaveBeenCalled();
    expect(commandHandler).toHaveBeenCalledTimes(1);
    expectCalledWithDefaults(commandHandler, ['b']);
  });
  test('calls subcommand with all args', async () => {
    await parser.parse(['expectAll', 'b', 'c', 'd']).call();
    expect(defaultHandler).not.toHaveBeenCalled();
    expect(commandHandler).toHaveBeenCalledTimes(1);
    expectCalledWithDefaults(commandHandler, ['b', 'c', 'd']);
  });
  test('calls subcommand with no args', async () => {
    await parser.parse(['expectNone']).call();
    expect(defaultHandler).not.toHaveBeenCalled();
    expect(commandHandler).toHaveBeenCalledTimes(1);
    expectCalledWithDefaults(commandHandler, []);
  });
  test('error handler catches invalid subcommand args', async () => {
    await expect(parser.parse(['expect1']).call()).resolves.not.toThrow();
    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(errorHandler).toHaveBeenCalledWith(
      new ValidationError('expect1 expects 1 argument, got 0'),
      expect.any(String),
    );
  });
  test('error handler catches handlers throwing ValidationError', async () => {
    defaultHandler.mockImplementationOnce(() => {
      throw new ValidationError('error');
    });
    await expect(parser.parse([]).call()).resolves.not.toThrow();
    expect(errorHandler).toHaveBeenCalledWith(
      new ValidationError('error'),
      expect.any(String),
    );
  });
  test('throws if subcommand is called with too few args', async () => {
    errorHandler.mockImplementationOnce((err) => {
      throw err;
    });
    await expect(parser.parse(['expect1']).call()).rejects.toThrow(
      new ValidationError('expect1 expects 1 argument, got 0'),
    );
  });
  test('throws if subcommand is called with too many args', async () => {
    errorHandler.mockImplementationOnce((err) => {
      throw err;
    });
    await expect(parser.parse(['expectNone', 'b']).call()).rejects.toThrow(
      new ValidationError('expectNone expects 0 arguments, got 1'),
    );
  });
  test('never throws if subcommand expects all args', async () => {
    for (const args of [
      [],
      ['arg1'],
      ['arg1', 'arg2'],
      Array(10).fill('arg'),
    ]) {
      await expect(
        parser.parse(['expectAll', ...args]).call(),
      ).resolves.not.toThrow();
    }
  });
  test('awaits async', async () => {
    const parser = new Parser({
      meta: {},
      commands: new Map(),
      options: new Map(),
      parsers: new Map(),
      /* eslint-disable-next-line require-await */
      globalSetter: async () => ({ database: 'db' }),
      defaultHandler,
    });
    await parser.parse([]).call();
    expect(defaultHandler).toHaveBeenCalledTimes(1);
    expect(defaultHandler).toHaveBeenCalledWith(
      expect.objectContaining({ globals: { database: 'db' } }),
    );
  });

  test('binds call', async () => {
    const { call } = parser.parse(['a', 'b']);
    await call();
    expect(defaultHandler).toHaveBeenCalledTimes(1);
  });
});
