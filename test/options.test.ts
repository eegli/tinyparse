import { Options } from '../src/options';

describe('Options', () => {
  test('key merging', () => {
    let options = new Options({ a: '', b: false });
    expect([...options.entries()]).toStrictEqual([
      ['a', { _type: 'string' }],
      ['b', { _type: 'boolean' }],
    ]);

    options = new Options(
      { a: '', b: 0 },
      {
        options: { a: { description: 'void' }, ignoreThis: {} },
      }
    );

    expect([...options.entries()]).toStrictEqual([
      ['a', { description: 'void', _type: 'string' }],
      ['b', { _type: 'number' }],
    ]);
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
    });
  });
  test('alias construction with flag conversion', () => {
    const options = new Options(
      { firstfirst: 0, secondSecond: 0, Thirdthird: 0 },
      {
        options: {
          firstfirst: { shortFlag: '-f' },
          secondSecond: { shortFlag: '---second' },
        },
        decamelize: true,
        filePathArg: {
          longFlag: ' --file',
        },
      }
    );
    expect(options.shouldDecamelize).toBeTruthy();
    expect(options.filePathArg).toStrictEqual({ longFlag: 'file' });
    expect(options.aliases.get('-f')).toBe('firstfirst');
    expect(options.aliases.get('-second')).toBe('secondSecond');
    expect(options.aliases.get('--second-second')).toBe('secondSecond');
    expect(options.aliases.get('--thirdthird')).toBe('Thirdthird');
  });
});
