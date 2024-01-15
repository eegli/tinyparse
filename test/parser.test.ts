import { Parser } from '../src/parser';
import {
  AnyGlobal,
  CommandOptionMap,
  FlagOptionMap,
  FlagOptionRecord,
} from '../src/types';

const commandHandler = jest.fn();
const defaultHandler = jest.fn();

afterEach(() => {
  commandHandler.mockClear();
  defaultHandler.mockClear();
});

const options: FlagOptionMap = new Map([
  ['flag1', { defaultValue: '', longFlag: '--flag1' }],
]);
const commands: CommandOptionMap<FlagOptionRecord, AnyGlobal> = new Map([
  [
    'expect1',
    {
      args: ['arg1'],
      handler: commandHandler,
    },
  ],
  [
    'expectAll',
    {
      args: 'all',
      handler: commandHandler,
    },
  ],
  [
    'expectNone',
    {
      args: [],
      handler: commandHandler,
    },
  ],
]);
const globals: AnyGlobal = {
  database: 'db',
};
const parser = new Parser(options, commands, globals, defaultHandler);

const expectCalledWith = (args: string[]) => ({
  options: { flag1: '' },
  globals: globals,
  args,
});

describe('parser', () => {
  test('returns callable and options', () => {
    const { call, options } = parser.parse([]);
    expect(call).toBeDefined();
    expect(options).toEqual({ flag1: '' });
  });
  test('does nothing without handlers', () => {
    expect(new Parser(options, commands).parse([]).call()).toBeUndefined();
  });
  test('calls default handler', () => {
    parser.parse([]).call();
    expect(defaultHandler).toHaveBeenCalledTimes(1);
    expect(defaultHandler).toHaveBeenCalledWith(expectCalledWith([]));
  });
  test('calls default handler when no subcommand matches', () => {
    parser.parse(['a']).call();
    expect(defaultHandler).toHaveBeenCalledTimes(1);
    expect(defaultHandler).toHaveBeenCalledWith(expectCalledWith(['a']));
    expect(commandHandler).not.toHaveBeenCalled();
  });
  test('calls subcommand with fixed args', () => {
    parser.parse(['expect1', 'b']).call();
    expect(defaultHandler).not.toHaveBeenCalled();
    expect(commandHandler).toHaveBeenCalledTimes(1);
    expect(commandHandler).toHaveBeenCalledWith(expectCalledWith(['b']));
  });
  test('calls subcommand with all args', () => {
    parser.parse(['expectAll', 'b', 'c', 'd']).call();
    expect(defaultHandler).not.toHaveBeenCalled();
    expect(commandHandler).toHaveBeenCalledTimes(1);
    expect(commandHandler).toHaveBeenCalledWith(
      expectCalledWith(['b', 'c', 'd']),
    );
  });
  test('calls subcommand with no args', () => {
    parser.parse(['expectNone']).call();
    expect(defaultHandler).not.toHaveBeenCalled();
    expect(commandHandler).toHaveBeenCalledTimes(1);
    expect(commandHandler).toHaveBeenCalledWith(expectCalledWith([]));
  });
  test('throws if subcommand is called with too few args', () => {
    expect(() => {
      parser.parse(['expect1']).call();
    }).toThrow('expect1 expects 1 argument, got 0');
  });
  test('throws if subcommand is called with too many args', () => {
    expect(() => {
      parser.parse(['expectNone', 'b']).call();
    }).toThrow('expectNone expects 0 arguments, got 1');
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
