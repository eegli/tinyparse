import { Parser } from '../src';

const mockCommandHandler = jest.fn();
const mockDefaultHandler = jest.fn();

afterEach(() => {
  mockCommandHandler.mockClear();
  mockDefaultHandler.mockClear();
});

describe('command delegation', () => {
  test('does nothing without handlers', () => {
    expect(() => {
      new Parser().build().defaultHandler().parse([]).call();
    }).not.toThrow();
  });
  test('calls default handler', () => {
    new Parser().build().defaultHandler(mockDefaultHandler).parse([]).call();
    expect(mockDefaultHandler).toHaveBeenCalledTimes(1);
    expect(mockDefaultHandler).toHaveBeenCalledWith({}, []);
  });
  const parser = new Parser()
    .build()
    .subcommand('foo', {
      args: ['arg1'],
      handler: mockCommandHandler,
    })
    .defaultHandler(mockDefaultHandler);

  test('calls default handler when no subcommand matches', () => {
    parser.parse(['bar']).call();
    expect(mockDefaultHandler).toHaveBeenCalledTimes(1);
    expect(mockDefaultHandler).toHaveBeenCalledWith({}, ['bar']);
    expect(mockCommandHandler).not.toHaveBeenCalled();
  });
  test('calls matching subcommand', () => {
    parser.parse(['foo', 'baz']).call();
    expect(mockDefaultHandler).not.toHaveBeenCalled();
    expect(mockCommandHandler).toHaveBeenCalledTimes(1);
    expect(mockCommandHandler).toHaveBeenCalledWith({}, ['baz']);
  });
});

describe('subcommand argument insertion', () => {
  const parser = new Parser()
    .flag('flag', {
      defaultValue: 'default',
      longFlag: '--flag',
    })
    .build()
    .subcommand('foo', {
      args: ['arg1', 'arg2'],
      handler: mockCommandHandler,
    })
    .defaultHandler(mockDefaultHandler);
  test('inserts arguments with default handler', () => {
    parser.parse(['bar', 'baz', 'qux']).call();
    expect(mockDefaultHandler).toHaveBeenCalledTimes(1);
    expect(mockDefaultHandler).toHaveBeenCalledWith({ flag: 'default' }, [
      'bar',
      'baz',
      'qux',
    ]);
    expect(mockCommandHandler).not.toHaveBeenCalled();
  });
  test('inserts arguments for subcommands', () => {
    parser.parse(['foo', 'baz', 'qux']).call();
    expect(mockDefaultHandler).not.toHaveBeenCalled();
    expect(mockCommandHandler).toHaveBeenCalledTimes(1);
    expect(mockCommandHandler).toHaveBeenCalledWith({ flag: 'default' }, [
      'baz',
      'qux',
    ]);
  });
});

describe('subcommand argument validation', () => {
  test('fixed number of arguments', () => {
    const parser = new Parser()
      .build()
      .subcommand('foo', {
        args: ['arg1'],
        handler: mockCommandHandler,
      })
      .defaultHandler();

    expect(() => {
      parser.parse(['foo', 'arg1']);
    }).not.toThrow();
    expect(() => {
      parser.parse(['foo']);
    }).toThrow('foo expects 1 argument, got 0');
    expect(() => {
      parser.parse(['foo', 'arg1', 'arg2']);
    }).toThrow('foo expects 1 argument, got 2');
  });
  test('all arguments', () => {
    const parser = new Parser()
      .build()
      .subcommand('foo', {
        args: 'all',
        handler: mockCommandHandler,
      })
      .defaultHandler();

    for (const args of [
      [],
      ['arg1'],
      ['arg1', 'arg2'],
      Array(10).fill('arg'),
    ]) {
      expect(() => {
        parser.parse(['foo', ...args]);
      }).not.toThrow();
    }
  });
  test('zero arguments', () => {
    const parser = new Parser()
      .build()
      .subcommand('foo', {
        args: [],
        handler: mockCommandHandler,
      })
      .defaultHandler();
    expect(() => {
      parser.parse(['foo']);
    }).not.toThrow();
    for (const args of [['arg1'], ['arg1', 'arg2']]) {
      expect(() => {
        parser.parse(['foo', ...args]);
      }).toThrow();
    }
  });
});
