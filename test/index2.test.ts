import { ParserBuilder } from '../src';

const mockHandler = jest.fn();
const mockExecutor = jest.fn();

afterEach(() => {
  mockHandler.mockClear();
  mockExecutor.mockClear();
});

test('main', () => {
  new ParserBuilder()
    .flag('f1', {
      longFlag: '--f1',
      shortFlag: '-f',
      defaultValue: '',
    })
    .flag('f2', {
      longFlag: '--f2',
      defaultValue: 0,
    })
    .flag('f3', {
      longFlag: '--f3',
      defaultValue: new Date(0),
    })
    .default(mockExecutor)
    .parse(['--f1', 'hello', '--f2', '1', '--f3', '1970-01-01']);

  expect(mockExecutor.mock.calls[0]).toMatchInlineSnapshot(`
    [
      {
        "f1": "hello",
        "f2": 1,
        "f3": 1970-01-01T00:00:00.000Z,
      },
      [],
    ]
  `);
});

test('main 2', () => {
  new ParserBuilder()
    .subcommand('hello', {
      handler: mockHandler,
    })
    .default(mockExecutor)
    .parse(['hello']);

  expect(mockExecutor).not.toHaveBeenCalled();
  expect(mockHandler).toHaveBeenCalled();
});

test('main 3', () => {
  new ParserBuilder()
    .subcommand('hello', {
      handler: mockHandler,
    })
    .default(mockExecutor)
    .parse([]);

  expect(mockExecutor).toHaveBeenCalled();
  expect(mockHandler).not.toHaveBeenCalled();
});
