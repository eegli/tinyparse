import { Parser } from '../src/parser';
import { CommandOptionMap, FlagOptionMap, FlagRecord } from '../src/types';

const commandHandler = jest.fn();
const defaultHandler = jest.fn();

afterEach(() => {
  commandHandler.mockClear();
  defaultHandler.mockClear();
});

const flags: FlagOptionMap = new Map([
  ['flag1', { defaultValue: '', longFlag: '--flag1' }],
]);
const commands: CommandOptionMap<FlagRecord> = new Map([
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
const parser = new Parser(flags, commands, defaultHandler);

describe('parser', () => {
  test('does nothing without handlers', () => {
    expect(new Parser(flags, commands).parse([]).call()).toBeUndefined();
  });
  test('calls default handler', () => {
    parser.parse([]).call();
    expect(defaultHandler).toHaveBeenCalledTimes(1);
    expect(defaultHandler).toHaveBeenCalledWith({ flag1: '' }, []);
  });
  test('calls default handler when no subcommand matches', () => {
    parser.parse(['a']).call();
    expect(defaultHandler).toHaveBeenCalledTimes(1);
    expect(defaultHandler).toHaveBeenCalledWith({ flag1: '' }, ['a']);
    expect(commandHandler).not.toHaveBeenCalled();
  });
  test('calls subcommand with fixed args', () => {
    parser.parse(['expect1', 'b']).call();
    expect(defaultHandler).not.toHaveBeenCalled();
    expect(commandHandler).toHaveBeenCalledTimes(1);
    expect(commandHandler).toHaveBeenCalledWith({ flag1: '' }, ['b']);
  });
  test('calls subcommand with all args', () => {
    parser.parse(['expectAll', 'b', 'c', 'd']).call();
    expect(defaultHandler).not.toHaveBeenCalled();
    expect(commandHandler).toHaveBeenCalledTimes(1);
    expect(commandHandler).toHaveBeenCalledWith({ flag1: '' }, ['b', 'c', 'd']);
  });
  test('calls subcommand with no args', () => {
    parser.parse(['expectNone']).call();
    expect(defaultHandler).not.toHaveBeenCalled();
    expect(commandHandler).toHaveBeenCalledTimes(1);
    expect(commandHandler).toHaveBeenCalledWith({ flag1: '' }, []);
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
