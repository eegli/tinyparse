import { CommandBuilder } from '../src/commands';
import { Parser } from '../src/parser';

describe('command builder', () => {
  test('returns a parser', () => {
    const parser = new CommandBuilder(new Map()).defaultHandler();
    expect(parser).toBeInstanceOf(Parser);
  });
  test('throws for subcommands that are declared twice', () => {
    expect(() => {
      new CommandBuilder(new Map())
        .subcommand('foo', {
          args: [],
          handler: () => {},
        })
        .subcommand('foo', {
          args: [],
          handler: () => {},
        });
    }).toThrow('Command foo already exists');
  });
});
