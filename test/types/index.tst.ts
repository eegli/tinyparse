import { describe, expect, test } from 'tstyche';
import { Parser } from '../../src';
import { CommandArgPattern, Subcommand } from '../../src/types';

describe('subcommand option and global arguments', () => {
  const subcommand = new Parser()
    .option('foo', {
      defaultValue: 'default',
      longFlag: '--foo',
    })
    .option('bar', {
      defaultValue: 0,
      longFlag: '--bar',
    })
    .option('baz', {
      defaultValue: false,
      longFlag: '--baz',
    })
    .option('qux', {
      defaultValue: new Date(),
      longFlag: '--qux',
    })
    .setGlobals(() => ({
      database: 'db',
    })).subcommand;

  type HandlerParams = Parameters<
    Parameters<typeof subcommand>[1]['handler']
  >[0];
  type HandlerFlagParams = HandlerParams['options'];
  type HandlerGlobalParams = HandlerParams['globals'];

  test('flags are inferred', () => {
    expect<HandlerFlagParams>().type.toMatch<{
      foo: string;
      bar: number;
      baz: boolean;
      qux: Date;
    }>();
  });
  test('globals are inferred', () => {
    expect<HandlerGlobalParams>().type.toMatch<{
      database: string;
    }>();
  });
});

describe('subcommand positional args', () => {
  type Empty = Record<never, never>;
  type HandlerArgParams<T extends CommandArgPattern> = Parameters<
    Subcommand<Empty, Empty, T>['handler']
  >[0]['args'];

  test('fixed length', () => {
    expect<HandlerArgParams<[string, string]>>().type.toEqual<
      [string, string]
    >();
  });
  test('fixed length (literal)', () => {
    expect<HandlerArgParams<['a', 'b']>>().type.toEqual<[string, string]>();
  });
  test('any length', () => {
    expect<HandlerArgParams<string>>().type.toEqual<string[]>();
  });
  test('any length (literal)', () => {
    expect<HandlerArgParams<'a'>>().type.toEqual<string[]>();
  });
});
