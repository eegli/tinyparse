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
    }).toThrow('Flag "--foo" has been declared twice');
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
    }).toThrow('Flag "-f" has been declared twice');
  });
  test('throws for invalid oneOf', () => {
    expect(() => {
      new CommandBuilder().option('foo', {
        defaultValue: 'default',
        longFlag: '--foo',
        oneOf: [1],
      });
    }).toThrow(
      'OneOf for option "foo" contains invalid type number, expected string',
    );
    expect(() => {
      new CommandBuilder().option('foo', {
        defaultValue: new Date(),
        longFlag: '--foo',
        oneOf: [],
      });
    }).toThrow('OneOf can only be used with string or number');
    expect(() => {
      new CommandBuilder().option('foo', {
        defaultValue: false,
        longFlag: '--foo',
        oneOf: [],
      });
    }).toThrow('OneOf can only be used with string or number');
  });
  test('throws for taken subparsers', () => {
    const builder = new CommandBuilder();
    builder.subcommand('foo', {
      args: [],
      handler: () => {},
    });
    expect(() => {
      builder.subparser('foo', {
        parser: new CommandBuilder().defaultHandler(),
      });
    }).toThrow('Command "foo" has been declared twice');
  });
  test('throws for taken tokens (meta last)', () => {
    const builder = new CommandBuilder()
      .option('opthelp', {
        defaultValue: false,
        longFlag: '--help',
        shortFlag: '-h',
      })
      .subcommand('help', {
        args: undefined,
        handler: () => {},
      });
    expect(() => {
      builder.setMeta({
        help: {
          command: 'help',
          longFlag: '--ignore',
        },
      });
    }).toThrow('Command "help" has been declared twice');
    expect(() => {
      builder.setMeta({
        help: {
          longFlag: '--help',
        },
      });
    }).toThrow('Flag "--help" has been declared twice');
    expect(() => {
      builder.setMeta({
        help: {
          longFlag: '--ignore',
          shortFlag: '-h',
        },
      });
    }).toThrow('Flag "-h" has been declared twice');
  });
  test('throws for taken tokens (meta first)', () => {
    const builder = new CommandBuilder().setMeta({
      help: {
        command: 'help',
        longFlag: '--help',
        shortFlag: '-h',
      },
    });
    expect(() => {
      builder.subcommand('help', {
        handler: () => {},
        args: [],
      });
    }).toThrow('Command "help" has been declared twice');
    expect(() => {
      builder.option('ignore1', {
        longFlag: '--help',
        defaultValue: false,
      });
    }).toThrow('Flag "--help" has been declared twice');
    expect(() => {
      builder.option('ignore2', {
        longFlag: '--ignore',
        shortFlag: '-h',
        defaultValue: false,
      });
    }).toThrow('Flag "-h" has been declared twice');
  });
});
