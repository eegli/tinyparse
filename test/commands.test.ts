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
    }).toThrow('Command "foo" has been declared twice');
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
        });
    }).toThrow('Option "foo" has been declared twice');
  });
  test('throws for flag values that are declared twice', () => {
    expect(() => {
      new CommandBuilder()
        .option('foo', {
          defaultValue: 'default',
          longFlag: '--foo',
        })
        .option('bar', {
          defaultValue: 'default',
          longFlag: '--foo',
        });
    }).toThrow(
      'Long flag "--foo" has been declared twice, initially by option "foo"',
    );
    expect(() => {
      new CommandBuilder()
        .option('foo', {
          defaultValue: '',
          longFlag: '--foo',
          shortFlag: '-f',
        })
        .option('bar', {
          defaultValue: '',
          longFlag: '--bar',
          shortFlag: '-f',
        });
    }).toThrow(
      'Short flag "-f" has been declared twice, initially by option "foo"',
    );
  });
  test('throws for taken help command tokens', () => {
    const builder = new CommandBuilder()
      .option('any', {
        defaultValue: '',
        longFlag: '--help',
        shortFlag: '-h',
      })
      .subcommand('help', {
        args: [],
        handler: () => {},
      });
    expect(() => {
      builder.setHelp('help');
    }).toThrow(
      'Help identifier "help" has already been declared as a subcommand',
    );
    expect(() => {
      builder.setHelp('--help');
    }).toThrow('Help identifier "--help" has already been declared as a flag');
    expect(() => {
      builder.setHelp('-h');
    }).toThrow('Help identifier "-h" has already been declared as a flag');
  });
});
