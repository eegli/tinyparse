import { ValidationError } from '../src/error';
import { Parser } from '../src/parser';
import { CommandOptionsMap, FlagOptionsMap } from '../src/types';

const commandHandler = jest.fn();
const defaultHandler = jest.fn();
const onError = jest.fn();

afterEach(() => {
  commandHandler.mockClear();
  defaultHandler.mockClear();
  onError.mockClear();
});

const options: FlagOptionsMap = new Map([
  ['flag1', { defaultValue: 0, longFlag: '--flag1' }],
]);
const commands: CommandOptionsMap = new Map([
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
]);
const globalSetter = () => {
  return { database: 'db' };
};

const parser = new Parser({
  meta: {},
  options,
  commands,
  globalSetter,
  defaultHandler,
});

const expectCalledWithDefaults = (mock: jest.Mock, args: string[]) => {
  expect(mock.mock.calls[0][0]).toEqual(
    expect.objectContaining({
      options: { flag1: 0 },
      globals: { database: 'db' },
      args,
    }),
  );
};

describe('parser', () => {
  test('returns callable', () => {
    const { call } = parser.parse([]);
    expect(call()).toBeUndefined();
  });
  test('calls default handler', () => {
    parser.parse([]).call();
    expect(defaultHandler).toHaveBeenCalledTimes(1);
    expectCalledWithDefaults(defaultHandler, []);
  });
  test('calls default handler when no subcommand matches', () => {
    parser.parse(['a']).call();
    expect(defaultHandler).toHaveBeenCalledTimes(1);
    expectCalledWithDefaults(defaultHandler, ['a']);
    expect(commandHandler).not.toHaveBeenCalled();
  });
  test('calls subcommand with fixed args', () => {
    parser.parse(['expect1', 'b']).call();
    expect(defaultHandler).not.toHaveBeenCalled();
    expect(commandHandler).toHaveBeenCalledTimes(1);
    expectCalledWithDefaults(commandHandler, ['b']);
  });
  test('calls subcommand with all args', () => {
    parser.parse(['expectAll', 'b', 'c', 'd']).call();
    expect(defaultHandler).not.toHaveBeenCalled();
    expect(commandHandler).toHaveBeenCalledTimes(1);
    expectCalledWithDefaults(commandHandler, ['b', 'c', 'd']);
  });
  test('calls subcommand with no args', () => {
    parser.parse(['expectNone']).call();
    expect(defaultHandler).not.toHaveBeenCalled();
    expect(commandHandler).toHaveBeenCalledTimes(1);
    expectCalledWithDefaults(commandHandler, []);
  });
  test('error handler catches invalid subcommand args', () => {
    expect(() => {
      parser.parse(['expect1'], onError).call();
    }).not.toThrow();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      new ValidationError('expect1 expects 1 argument, got 0'),
      expect.any(String),
    );
  });
  test('error handler catches handlers throwing ValidationError', () => {
    defaultHandler.mockImplementationOnce(() => {
      throw new ValidationError('error');
    });
    expect(() => {
      parser.parse([], onError).call();
    }).not.toThrow();
    expect(onError).toHaveBeenCalledWith(
      new ValidationError('error'),
      expect.any(String),
    );
    onError.mockClear();
    commandHandler.mockImplementationOnce(() => {
      throw new ValidationError('error');
    });
    expect(() => {
      parser.parse(['expect1', 'arg1'], onError).call();
    }).not.toThrow();
    expect(onError).toHaveBeenCalledWith(
      new ValidationError('error'),
      expect.any(String),
    );
  });
  test('throws if subcommand is called with too few args', () => {
    expect(() => {
      parser.parse(['expect1']).call();
    }).toThrow(new ValidationError('expect1 expects 1 argument, got 0'));
  });
  test('throws if subcommand is called with too many args', () => {
    expect(() => {
      parser.parse(['expectNone', 'b']).call();
    }).toThrow(new ValidationError('expectNone expects 0 arguments, got 1'));
  });
  test('never throws if subcommand expects all args', () => {
    for (const args of [
      [],
      ['arg1'],
      ['arg1', 'arg2'],
      Array(10).fill('arg'),
    ]) {
      expect(() => {
        parser.parse(['expectAll', ...args]);
      }).not.toThrow();
    }
  });
  test('binds call', () => {
    const { call } = parser.parse(['a', 'b']);
    call();
    expect(defaultHandler).toHaveBeenCalledTimes(1);
  });
});
