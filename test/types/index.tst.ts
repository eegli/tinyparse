import { describe, expect, test } from 'tstyche';
import { Parser } from '../../src';
import {
  HandlerGlobals,
  HandlerOptions,
  HandlerParams,
} from '../../src/types/helpers';
import { Subcommand } from '../../src/types/internals';

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
      fetch: () => {},
    })).subcommand;

  type HandlerParams = Parameters<
    Parameters<typeof subcommand>[1]['handler']
  >[0];
  type HandlerFlagParams = HandlerParams['options'];
  type HandlerGlobalParams = HandlerParams['globals'];

  test('flags are inferred', () => {
    expect<HandlerFlagParams>().type.toBeAssignable<{
      foo: string;
      bar: number;
      baz: boolean;
      qux: Date;
    }>();
    expect<HandlerFlagParams>().type.toMatch<{
      foo: string;
      bar: number;
      baz: boolean;
      qux: Date;
    }>();
    expect<HandlerFlagParams>().type.not.toBeAssignable<{ unknown: string }>();
    expect<{ unknown: string }>().type.not.toMatch<HandlerFlagParams>();
  });
  test('globals are inferred', () => {
    expect<HandlerGlobalParams>().type.toEqual<{
      database: string;
      fetch: () => void;
    }>();
  });
});

describe('subcommand positional args', () => {
  type Empty = Record<never, never>;
  type HandlerArgParams<T> = Parameters<
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

describe('subcommand modular external definition', () => {
  type Options = typeof options;
  const options = new Parser()
    .option('foo', {
      defaultValue: 'default',
      longFlag: '--foo',
    })
    .option('bar', {
      defaultValue: 0,
      longFlag: '--bar',
    })
    .setGlobals(() => ({
      database: 'db',
    }));

  test('zero args', () => {
    type SubcommandParams = HandlerParams;

    // eslint-disable-next-line @typescript-eslint/ban-types
    expect<SubcommandParams>().type.toEqual<{}>();
  });
  test('with options', () => {
    type SubcommandParams = HandlerParams<HandlerOptions<Options>>;

    expect<SubcommandParams>().type.toEqual<{
      options: HandlerOptions<Options>;
    }>();
  });
  test('with globals and options', () => {
    type SubcommandParams = HandlerParams<
      HandlerOptions<Options>,
      never,
      HandlerGlobals<Options>
    >;

    expect<SubcommandParams>().type.toEqual<{
      options: HandlerOptions<Options>;
      globals: HandlerGlobals<Options>;
    }>();
  });
  test('with help', () => {
    type SubcommandParams = HandlerParams<never, never, never, string>;

    expect<SubcommandParams>().type.toEqual<{
      usage: string;
    }>();
  });
});
