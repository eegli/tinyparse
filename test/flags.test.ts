import { ValidationError } from '../src';
import { collectFlags } from '../src/flags';
import { FlagOptions, FlagValue } from '../src/types/internals';

type Input = [string, string | null];
type Options = [string, FlagOptions<FlagValue, boolean>];

describe('flags', () => {
  test('replaces defaults and ignores unknown', () => {
    const options: Options[] = [
      ['foo', { longFlag: '--foo', defaultValue: 'default' }],
      ['bar', { longFlag: '--bar', shortFlag: '-b', defaultValue: 'default' }],
      ['baz', { longFlag: '--baz', defaultValue: 'default' }],
    ];
    const input: Input[] = [
      ['--foo', 'bar'],
      ['-b', 'qux'],
    ];
    const collected = collectFlags(new Map(input), new Map(options));
    expect(collected).toStrictEqual({ foo: 'bar', bar: 'qux', baz: 'default' });
  });
  test('allows boolean shortcuts and true, false', () => {
    const options: Options[] = [
      ['foo', { longFlag: '--foo', defaultValue: false }],
      ['bar', { longFlag: '--bar', defaultValue: false }],
      ['baz', { longFlag: '--baz', defaultValue: true }],
    ];
    const input: Input[] = [
      ['--foo', null],
      ['--bar', 'true'],
      ['--baz', 'false'],
    ];
    const collected = collectFlags(new Map(input), new Map(options));
    expect(collected).toStrictEqual({ foo: true, bar: true, baz: false });
  });
  test('converts valid dates and numbers', () => {
    const options: Options[] = [
      ['foo', { longFlag: '--foo', defaultValue: 0 }],
      ['bar', { longFlag: '--bar', defaultValue: new Date() }],
    ];
    const input: Input[] = [
      ['--foo', '1'],
      ['--bar', '2023'],
    ];
    const collected = collectFlags(new Map(input), new Map(options));
    expect(collected).toStrictEqual({
      foo: 1,
      bar: new Date('2023'),
    });
  });
  test('rejects for missing required', () => {
    const options: Options[] = [
      ['foo', { longFlag: '--foo', defaultValue: 'default', required: true }],
    ];
    const input: Input[] = [];
    expect(() => collectFlags(new Map(input), new Map(options))).toThrow(
      ValidationError,
    );
    expect(() => collectFlags(new Map(input), new Map(options))).toThrow(
      'Missing required option --foo',
    );
  });
  test('rejects for invalid types', () => {
    const inputs: [Input, FlagOptions<FlagValue, boolean>][] = [
      [['--foo', null], { longFlag: '--foo', defaultValue: 'string' }],
      [['--foo', 'bar'], { longFlag: '--foo', defaultValue: true }],
      [['--foo', 'bar'], { longFlag: '--foo', defaultValue: 1 }],
      [['--foo', 'bar'], { longFlag: '--foo', defaultValue: new Date() }],
    ];
    for (const [input, option] of inputs) {
      const inputs = new Map([input]);
      const options = new Map([[option.longFlag, option]]);

      expect(() => collectFlags(inputs, options)).toThrow(ValidationError);
      expect(() => collectFlags(inputs, options)).toThrowErrorMatchingSnapshot(
        `<${input.join(' ')}>`,
      );
    }
  });
  test('respects oneof setting', () => {
    const options: Options[] = [
      ['foo', { longFlag: '--foo', defaultValue: 'a', oneOf: ['b'] }],
      [
        'bar',
        { longFlag: '--bar', defaultValue: 0, oneOf: [0, 1], required: true },
      ],
    ];

    expect(() =>
      collectFlags(new Map([['--foo', 'c']]), new Map(options)),
    ).toThrow(
      new ValidationError(
        'Invalid value "c" for option --foo, expected one of: a, b',
      ),
    );
    expect(() =>
      collectFlags(new Map([['--bar', '2']]), new Map(options)),
    ).toThrow('Invalid value "2" for option --bar, expected one of: 0, 1');
  });
});
