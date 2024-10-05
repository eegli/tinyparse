import { describe, expect, test } from 'tstyche';
import { Parser } from '../../src';
import {
  InferOptions,
  WithArgs,
  WithGlobals,
  WithOptions,
} from '../../src/types/helpers';
import { Subcommand } from '../../src/types/internals';

describe('subcommand params, internal declaration', () => {
  const subcommand = new Parser()
    .option('foo', {
      defaultValue: 'default',
      longFlag: '--foo',
    })
    .option('foo-choice', {
      defaultValue: 'default',
      oneOf: ['a', 'b'],
      longFlag: '--foo-c',
    })
    .option('foo-choice-req', {
      defaultValue: 'default',
      oneOf: ['a', 'b'],
      required: true,
      longFlag: '--foo-c-req',
    })
    .option('bar', {
      defaultValue: 0,
      longFlag: '--bar',
    })
    .option('bar-choice', {
      defaultValue: 0,
      oneOf: [],
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
    .globals(() => ({
      database: 'db',
      fetch: () => {},
    })).subcommand;

  type Params = Parameters<Parameters<typeof subcommand>[1]['handler']>[0];
  type FlagParams = Params['options'];
  type GlobalParams = Params['globals'];

  test('flags are inferred', () => {
    type ExpectedFlagParams = Record<'foo', string> &
      Record<'foo-choice', 'default' | 'a' | 'b'> &
      Record<'foo-choice-req', 'a' | 'b'> &
      Record<'bar', number> &
      Record<'bar-choice', 0> &
      Record<'baz', boolean> &
      Record<'qux', Date>;

    expect<FlagParams>().type.toEqual<ExpectedFlagParams>();
  });
  test('globals are inferred', () => {
    type ExpectedGlobalParams = {
      database: string;
      fetch: () => void;
    };
    expect<GlobalParams>().type.toEqual<ExpectedGlobalParams>();
  });
});

describe('subcommand params, external declaration', () => {
  const options = new Parser()
    .option('foo', {
      defaultValue: 'default',
      oneOf: ['a', 'b'],
      longFlag: '--foo',
    })
    .option('bar', {
      defaultValue: 0,
      longFlag: '--bar',
    });

  const globalSetter = (opts: InferOptions<typeof options>) => opts;

  const baseParser = options.globals(globalSetter);

  type OptionsOrGlobals = Record<'foo', 'default' | 'a' | 'b'> &
    Record<'bar', number>;

  type BaseParser = typeof baseParser;

  test('options and globals are inferred', () => {
    expect<WithOptions<BaseParser>>().type.toEqual<{
      options: OptionsOrGlobals;
    }>();
  });

  test('globals are inferred', () => {
    expect<WithGlobals<BaseParser>>().type.toEqual<{
      globals: OptionsOrGlobals;
    }>();
  });

  test('args are inferred', () => {
    expect<WithArgs<string[]>>().type.toEqual<{
      args: string[];
    }>();
    expect<WithArgs<[string, string]>>().type.toEqual<{
      args: [string, string];
    }>();
  });

  test('unions work', () => {
    expect<WithOptions<BaseParser> & WithGlobals<BaseParser>>().type.toEqual<
      {
        options: OptionsOrGlobals;
      } & {
        globals: OptionsOrGlobals;
      }
    >();
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
