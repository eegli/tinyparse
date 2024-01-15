import { ValidationError } from '../src';
import { collect } from '../src/options';
import {
  FlagInputMap,
  FlagOption,
  FlagOptionArgValue,
  FlagOptionMap,
} from '../src/types';

describe('flags', () => {
  test('replaces defaults and ignores unknown', () => {
    const options: FlagOptionMap = new Map([
      ['foo', { longFlag: '--foo', defaultValue: 'default' }],
      ['bar', { longFlag: '--bar', shortFlag: '-b', defaultValue: 'default' }],
      ['baz', { longFlag: '--baz', defaultValue: 'default' }],
    ]);
    const input: FlagInputMap = new Map([
      ['--foo', 'bar'],
      ['-b', 'qux'],
    ]);
    const collected = collect(input, options);
    expect(collected).toStrictEqual({ foo: 'bar', bar: 'qux', baz: 'default' });
  });
  test('allows boolean shortcuts and true, false', () => {
    const options: FlagOptionMap = new Map([
      ['foo', { longFlag: '--foo', defaultValue: false }],
      ['bar', { longFlag: '--bar', defaultValue: false }],
      ['baz', { longFlag: '--baz', defaultValue: true }],
    ]);
    const input: FlagInputMap = new Map<string, string | null>([
      ['--foo', null],
      ['--bar', 'true'],
      ['--baz', 'false'],
    ]);
    const collected = collect(input, options);
    expect(collected).toStrictEqual({ foo: true, bar: true, baz: false });
  });
  test('converts valid dates and numbers', () => {
    const options: FlagOptionMap = new Map([
      ['foo', { longFlag: '--foo', defaultValue: 0 }],
      ['bar', { longFlag: '--bar', defaultValue: new Date() }],
    ]);
    const input: FlagInputMap = new Map<string, string | null>([
      ['--foo', '1'],
      ['--bar', '2023'],
    ]);
    const collected = collect(input, options);
    expect(collected).toStrictEqual({
      foo: 1,
      bar: new Date('2023'),
    });
  });
  test('rejects for missing required', () => {
    const options: FlagOptionMap = new Map([
      ['foo', { longFlag: '--foo', defaultValue: 'default', required: true }],
    ]);
    const input: FlagInputMap = new Map([]);
    expect(() => collect(input, options)).toThrow(ValidationError);
    expect(() => collect(input, options)).toThrow(
      'Missing required option --foo',
    );
  });
  test('rejects for invalid types', () => {
    const inputs: [[string, string | null], FlagOption<FlagOptionArgValue>][] =
      [
        [['--foo', null], { longFlag: '--foo', defaultValue: 'string' }],
        [['--foo', 'bar'], { longFlag: '--foo', defaultValue: true }],
        [['--foo', 'bar'], { longFlag: '--foo', defaultValue: 1 }],
        [['--foo', 'bar'], { longFlag: '--foo', defaultValue: new Date() }],
      ];
    for (const [input, option] of inputs) {
      const inputs = new Map([input]);
      const options = new Map([[option.longFlag, option]]);

      expect(() => collect(inputs, options)).toThrow(ValidationError);
      expect(() => collect(inputs, options)).toThrowErrorMatchingSnapshot(
        `<${input.join(' ')}>`,
      );
    }
  });
});
