import { Parser } from '../src';

const mockCommandHandler = jest.fn();
const mockDefaultHandler = jest.fn();

afterEach(() => {
  mockCommandHandler.mockClear();
  mockDefaultHandler.mockClear();
});

describe('builder flags and subcommand validation', () => {
  test('throws for flags that are declared twice', () => {
    expect(() => {
      new Parser()
        .flag('foo', {
          defaultValue: 'default',
          longFlag: '--foo',
        })
        .flag('foo', {
          defaultValue: 'default',
          longFlag: '--foo',
        })
        .build();
    }).toThrow('Flag foo already exists');
  });
  test('throws for subcommands that are declared twice', () => {
    expect(() => {
      new Parser()
        .build()
        .subcommand('foo', {
          args: [],
          handler: mockCommandHandler,
        })
        .subcommand('foo', {
          args: [],
          handler: mockCommandHandler,
        });
    }).toThrow('Command foo already exists');
  });
});
