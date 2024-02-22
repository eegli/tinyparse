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
    }).toThrow('Long flag "--foo" has been declared twice');
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
    }).toThrow('Short flag "-f" has been declared twice');
  });
  test('throws for taken tokens (meta last)', () => {
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
      builder.setMeta({
        help: {
          command: 'help',
          longFlag: '--help',
        },
        appName: '',
      });
    }).toThrow(
      'Help identifier "help" has already been declared as a subcommand',
    );
    expect(() => {
      builder.setMeta({
        help: {
          longFlag: '--help',
        },
      });
    }).toThrow('Help identifier "--help" has already been declared as a flag');
    expect(() => {
      builder.setMeta({
        help: {
          longFlag: '--other',
          shortFlag: '-h',
        },
      });
    }).toThrow('Help identifier "-h" has already been declared as a flag');
  });
  test('throws for taken tokens (meta first)', () => {
    expect(() => {
      new CommandBuilder()
        .setMeta({
          help: {
            longFlag: '--help',
          },
        })
        .option('any', {
          longFlag: '--help',
          defaultValue: '',
        });
    }).toThrow('Long flag "--help" has been declared twice');
    expect(() => {
      new CommandBuilder()
        .setMeta({
          help: {
            command: 'help',
            longFlag: '--help',
          },
        })
        .subcommand('help', {
          handler: () => {},
          args: [],
        });
    }).toThrow('Subcommand "help" has already been declared as a help command');
  });
});
