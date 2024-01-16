import { CommandBuilder } from '../src/commands';
import { Parser } from '../src/parser';

describe('command builder', () => {
  test('returns a parser', () => {
    const parser = new CommandBuilder().defaultHandler(() => {});
    expect(parser).toBeInstanceOf(Parser);
  });
  test('calls globals with flags', () => {
    const parser = new CommandBuilder()
      .option('f1', {
        defaultValue: 'f1Default',
        longFlag: '--flag1',
      })
      .option('f2', {
        defaultValue: 'f2Default',
        longFlag: '--flag2',
      });
    const globalSpy = jest.fn();
    parser.globals(globalSpy);
    expect(globalSpy).toHaveBeenCalledTimes(1);
    expect(globalSpy).toHaveBeenCalledWith({
      f1: 'f1Default',
      f2: 'f2Default',
    });
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
