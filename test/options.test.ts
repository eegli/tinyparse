import { Options } from '../src/options';

describe('Options', () => {
  test('key merging', () => {
    let options = new Options(['a', 'b']);
    expect([...options.entries()]).toStrictEqual([
      ['a', {}],
      ['b', {}],
    ]);

    options = new Options(['a', 'b'], {
      options: { a: { description: 'void' }, ignoreThis: {} },
    });

    expect([...options.entries()]).toStrictEqual([
      ['a', { description: 'void' }],
      ['b', {}],
    ]);
  });
  test('flag conversion', () => {
    const options = new Options(['one', 'two'], {
      options: { one: { shortFlag: '-o' }, two: { shortFlag: 't' } },
      filePathArg: {
        longFlag: '--file',
        shortFlag: 'f',
      },
    });
    expect(options.filePathFlag).toStrictEqual({
      longFlag: '--file',
      shortFlag: '-f',
    });
    expect(options.aliases).toStrictEqual(
      new Map([
        ['-o', 'one'],
        ['-t', 'two'],
      ])
    );
  });
  test('aliases, trims short flags', () => {
    const options = new Options(['firstfirst', 'secondSecond', 'Thirdthird'], {
      options: {
        firstfirst: { shortFlag: '-f' },
        secondSecond: { shortFlag: '---second' },
      },
      decamelize: true,
      filePathArg: {
        longFlag: '--file',
      },
    });
    expect(options.shouldDecamelize).toBeTruthy();
    expect(options.filePathFlag).toStrictEqual({ longFlag: '--file' });
    expect(options.aliases).toStrictEqual(
      new Map([
        ['-f', 'firstfirst'],
        ['-second', 'secondSecond'],
        ['--second-second', 'secondSecond'],
        ['--thirdthird', 'Thirdthird'],
      ])
    );
  });
});
