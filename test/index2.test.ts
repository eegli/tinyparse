import { CommandBuilder } from '../src';

const mockCommandHandler = jest.fn();
const mockDefaultHandler = jest.fn();

afterEach(() => {
  mockCommandHandler.mockClear();
  mockDefaultHandler.mockClear();
});

test('main', () => {
  const command = new CommandBuilder()
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
    .build();
  const args = ['--f1', 'hello', '--f2', '1', '--f3', '1970-01-01'];
  const flags = command.parseFlags(args);
  expect(flags).toMatchInlineSnapshot(`
    {
      "f1": "hello",
      "f2": 1,
      "f3": 1970-01-01T00:00:00.000Z,
    }
  `);
  command.default(mockDefaultHandler).parse(args);

  expect(mockDefaultHandler.mock.calls).toMatchInlineSnapshot(`
    [
      [
        {
          "f1": "hello",
          "f2": 1,
          "f3": 1970-01-01T00:00:00.000Z,
        },
        [],
      ],
    ]
  `);
});

test('subcommand works', () => {
  new CommandBuilder()
    .subcommand('cmd', {
      args: ['arg1'] as const,
      handler: mockCommandHandler,
    })
    .build()
    .parse(['cmd', 'arg1']);
  expect(mockCommandHandler.mock.calls).toMatchInlineSnapshot(`
    [
      [
        {},
        [
          "arg1",
        ],
      ],
    ]
  `);
});

test('subcommand fails', () => {
  expect(() => {
    new CommandBuilder()
      .subcommand('cmd', {
        args: ['arg1'],
        handler: mockCommandHandler,
      })
      .build()
      .parse(['cmd']);
  }).toThrow('cmd expects 1 argument, got 0');
  expect(() => {
    new CommandBuilder()
      .subcommand('cmd', {
        args: ['arg1'],
        handler: mockCommandHandler,
      })
      .build()
      .parse(['cmd', 'arg1', 'arg2']);
  }).toThrow('cmd expects 1 argument, got 2');
});
