import { ValidationError } from '../src';
import { collectFlags } from '../src/flags';
import { FlagOptions, FlagOptionsMap, FlagValue } from '../src/types/internals';

describe('flags', () => {
  test('replaces defaults and ignores unknown', () => {
    const options: FlagOptionsMap = new Map([
      ['foo', { longFlag: '--foo', defaultValue: 'default' }],
      ['bar', { longFlag: '--bar', shortFlag: '-b', defaultValue: 'default' }],
      ['baz', { longFlag: '--baz', defaultValue: 'default' }],
    ]);
    const input: Map<string, string | null> = new Map([
      ['--foo', 'bar'],
      ['-b', 'qux'],
    ]);
    const collected = collectFlags(input, options);
    expect(collected).toStrictEqual({ foo: 'bar', bar: 'qux', baz: 'default' });
  });
  test('allows boolean shortcuts and true, false', () => {
    const options: FlagOptionsMap = new Map([
      ['foo', { longFlag: '--foo', defaultValue: false }],
      ['bar', { longFlag: '--bar', defaultValue: false }],
      ['baz', { longFlag: '--baz', defaultValue: true }],
    ]);
    const input: Map<string, string | null> = new Map<string, string | null>([
      ['--foo', null],
      ['--bar', 'true'],
      ['--baz', 'false'],
    ]);
    const collected = collectFlags(input, options);
    expect(collected).toStrictEqual({ foo: true, bar: true, baz: false });
  });
  test('converts valid dates and numbers', () => {
    const options: FlagOptionsMap = new Map([
      ['foo', { longFlag: '--foo', defaultValue: 0 }],
      ['bar', { longFlag: '--bar', defaultValue: new Date() }],
    ]);
    const input: Map<string, string | null> = new Map<string, string | null>([
      ['--foo', '1'],
      ['--bar', '2023'],
    ]);
    const collected = collectFlags(input, options);
    expect(collected).toStrictEqual({
      foo: 1,
      bar: new Date('2023'),
    });
  });
  test('rejects for missing required', () => {
    const options: FlagOptionsMap = new Map([
      ['foo', { longFlag: '--foo', defaultValue: 'default', required: true }],
    ]);
    const input: Map<string, string | null> = new Map([]);
    expect(() => collectFlags(input, options)).toThrow(ValidationError);
    expect(() => collectFlags(input, options)).toThrow(
      'Missing required option --foo',
    );
  });
  test('rejects for invalid types', () => {
    const inputs: [[string, string | null], FlagOptions<FlagValue>][] = [
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
    const options: FlagOptionsMap = new Map([
      ['foo', { longFlag: '--foo', defaultValue: 'a', oneOf: ['a', 'b'] }],
      ['bar', { longFlag: '--bar', defaultValue: 0, oneOf: [0, 1] }],
    ]);
    const input = new Map([['--foo', 'c']]);
    expect(() => collectFlags(input, options)).toThrow(ValidationError);
    expect(() => collectFlags(input, options)).toThrow(
      'Invalid value "c" for option --foo, expected one of: a, b',
    );
    expect(() => collectFlags(new Map([['--bar', '2']]), options)).toThrow(
      'Invalid value "2" for option --bar, expected one of: 0, 1',
    );
  });
});
