import { describe, expect, test } from 'tstyche';
import { Parser } from '../../src';
import { CommandArgPattern, Subcommand } from '../../src/types';

describe('subcommand flags', () => {
  test('subcommand flags', () => {
    const subcommand = new Parser()
      .flag('foo', {
        defaultValue: 'default',
        longFlag: '--foo',
      })
      .flag('bar', {
        defaultValue: 0,
        longFlag: '--bar',
      })
      .flag('baz', {
        defaultValue: false,
        longFlag: '--baz',
      })
      .flag('qux', {
        defaultValue: new Date(),
        longFlag: '--qux',
      })
      .build().subcommand;

    type HandlerParams = Parameters<typeof subcommand>[1]['handler'];
    type HandlerFlagParams = Parameters<HandlerParams>[0];

    expect<HandlerFlagParams>().type.toMatch<{
      foo: string;
      bar: number;
      baz: boolean;
      qux: Date;
    }>();
  });
});

describe('subcommand args', () => {
  type Empty = Record<never, never>;
  type HandlerArgParams<T extends CommandArgPattern> = Parameters<
    Subcommand<Empty, T>['handler']
  >[1];

  test('subcommand arguments, tuple length', () => {
    expect<HandlerArgParams<[string, string]>>().type.toEqual<
      [string, string]
    >();
  });
  test('subcommand arguments, any length', () => {
    expect<HandlerArgParams<string>>().type.toEqual<string[]>();
  });
});
