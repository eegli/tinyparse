import { CommandBuilder } from '../src/commands';
import { Parser } from '../src/parser';

describe('command builder', () => {
  test('returns a parser', () => {
    const parser = new CommandBuilder().defaultHandler(() => {});
    expect(parser).toBeInstanceOf(Parser);
  });
  test('throws for subcommands that are declared twice', () => {
    expect(() => {
      new CommandBuilder()
        .subcommand('foo', {
          args: [],
          handler: () => {},
        })
        .subcommand('foo', {
          args: [],
          handler: () => {},
        });
    }).toThrow('Command foo has been declared twice');
  });
  test('throws for flags that are declared twice', () => {
    expect(() => {
      new CommandBuilder()
        .option('foo', {
          defaultValue: 'default',
          longFlag: '--foo',
        })
        .option('foo', {
          defaultValue: 'default',
          longFlag: '--foo',
        })
        .defaultHandler();
    }).toThrow('Option foo has been declared twice');
  });
});
