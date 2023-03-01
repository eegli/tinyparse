import { Options } from '../src/options';

describe('Options', () => {
  test('constructor', () => {
    const options = new Options({ a: '', b: false });
    expect(Object.fromEntries(options.flagOptions)).toEqual({
      a: {
        type: 'string',
        isRequired: false,
        longFlag: '--a',
      },
      b: {
        type: 'boolean',
        isRequired: false,
        longFlag: '--b',
      },
    });
    expect(Object.fromEntries(options.aliases)).toEqual({
      '--a': 'a',
      '--b': 'b',
    });
    expect(options.filePathFlags.size).toBe(0);
  });
  test('constructor with options', () => {
    const options = new Options(
      { a: '', b: 0 },
      {
        options: {
          a: { required: true, description: 'void' },
          b: { shortFlag: 'b', longFlag: 'UpAndLoWeRCaSe' },
          ignoreThis: {},
        },
      }
    );
    expect(Object.fromEntries(options.flagOptions)).toEqual({
      a: {
        type: 'string',
        isRequired: true,
        longFlag: '--a',
        description: 'void',
      },
      b: {
        type: 'number',
        isRequired: false,
        longFlag: '--UpAndLoWeRCaSe',
        shortFlag: '-b',
      },
    });
    expect(Object.fromEntries(options.aliases)).toEqual({
      '--UpAndLoWeRCaSe': 'b',
      '-b': 'b',
      '--a': 'a',
    });

    expect(options.filePathFlags.size).toBe(0);
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
    expect(
      () => new Options({ abc: '' }, { filePathArg: { longFlag: 'abc' } })
    ).toThrow(
      'Conflicting flag: --abc has already been declared as a file path flag'
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
      expect(options.filePathFlags).toStrictEqual(new Set(['--file', '-f']));
    });
  });
  test('alias construction with flag conversion', () => {
    const options = new Options(
      { firstfirst: 0, secondSecond: 0, Thirdthird: 0 },
      {
        options: {
          firstfirst: { shortFlag: '-first' },
          secondSecond: { shortFlag: '---second' },
          Thirdthird: { longFlag: 'special-third' },
        },
        decamelize: true,
        filePathArg: {
          longFlag: 'file',
          shortFlag: 'f',
        },
      }
    );

    expect(options.filePathFlags.size).toBe(2);

    expect(options.aliases.get('-first')).toBe('firstfirst');
    expect(options.aliases.get('--firstfirst')).toBe('firstfirst');

    // Rewrite the two unit tests as above
    expect(options.aliases.get('-second')).toBe('secondSecond');
    expect(options.aliases.get('--second-second')).toBe('secondSecond');

    expect(options.aliases.get('--thirdthird')).toBeUndefined();
    expect(options.aliases.get('--special-third')).toBe('Thirdthird');
    expect(options.aliases.size).toBe(2 + 2 + 1);
  });
});
