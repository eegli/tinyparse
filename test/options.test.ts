import { Options } from '../src/options';
import { FlagType } from '../src/types';

describe('Options', () => {
  test('constructor', () => {
    const options = new Options({ a: '', b: false });
    expect([...options.values()]).toEqual([
      {
        _type: 'string',
        longFlag: 'a',
        required: false,
      },
      {
        _type: 'boolean',
        longFlag: 'b',
        required: false,
      },
    ]);
  });
  test('constructor with options', () => {
    const options = new Options(
      { a: '', b: 0 },
      {
        options: {
          a: { required: true, description: 'void' },
          b: { shortFlag: 'b', longFlag: 'longb' },
          ignoreThis: {},
        },
      }
    );

    expect([...options.values()]).toEqual([
      {
        _type: 'string',
        required: true,
        longFlag: 'a',
        description: 'void',
      },
      {
        _type: 'number',
        required: false,
        longFlag: 'longb',
        shortFlag: 'b',
      },
    ]);
  });
  test('conflicting alias construction', () => {
    expect(
      () =>
        new Options(
          { a: '', b: '' },
          { options: { a: { shortFlag: 'a' }, b: { shortFlag: 'a' } } }
        )
    ).toThrow(
      'Parser config validation error, conflicting short flag: -a has been declared twice. Check your settings for short flags.'
    );
    expect(
      () => new Options({ userName: '', 'user-name': '' }, { decamelize: true })
    ).toThrow(
      'Parser config validation error, conflicting long flag: --user-name has been declared twice. Check your settings for custom long flags and decamelization.'
    );
  });
  test('file path flag conversion', () => {
    [
      ['file', 'f'],
      ['--file', '--f'],
      ['-file', '-f'],
    ].forEach(([longFlag, shortFlag]) => {
      const options = new Options(
        {},
        {
          filePathArg: {
            longFlag,
            shortFlag,
          },
        }
      );
      expect(options.filePathArg).toStrictEqual({
        longFlag: 'file',
        shortFlag: 'f',
      });
      expect(options.aliases.get('file')).toStrictEqual({
        originalFlag: 'file',
        flagType: FlagType.Long,
      });
      expect(options.aliases.get('f')).toStrictEqual({
        originalFlag: 'f',
        flagType: FlagType.Short,
      });
      expect(options.aliases.size).toBe(2);
    });
  });
  test('alias construction with flag conversion', () => {
    const options = new Options(
      { firstfirst: 0, secondSecond: 0, Thirdthird: 0 },
      {
        options: {
          firstfirst: { shortFlag: '-f' },
          secondSecond: { shortFlag: '---second' },
          Thirdthird: { longFlag: 'special-third' },
        },
        decamelize: true,
        filePathArg: {
          longFlag: ' --file',
        },
      }
    );
    expect(options.shouldDecamelize).toBeTruthy();
    expect(options.filePathArg).toStrictEqual({ longFlag: 'file' });

    expect(options.aliases.get('file')).toStrictEqual({
      originalFlag: 'file',
      flagType: FlagType.Long,
    });

    expect(options.aliases.get('f')).toStrictEqual({
      originalFlag: 'firstfirst',
      flagType: FlagType.Short,
    });
    expect(options.aliases.get('firstfirst')).toStrictEqual({
      originalFlag: 'firstfirst',
      flagType: FlagType.Long,
    });

    // Rewrite the two unit tests as above
    expect(options.aliases.get('second')).toStrictEqual({
      originalFlag: 'secondSecond',
      flagType: FlagType.Short,
    });
    expect(options.aliases.get('second-second')).toStrictEqual({
      originalFlag: 'secondSecond',
      flagType: FlagType.Long,
    });

    expect(options.aliases.get('thirdthird')).toBeUndefined();
    expect(options.aliases.get('special-third')).toStrictEqual({
      originalFlag: 'Thirdthird',
      flagType: FlagType.Long,
    });
    expect(options.aliases.size).toBe(1 + 2 + 2 + 1);
  });
});
