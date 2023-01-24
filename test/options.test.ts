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
  test('flag conversion', () => {
    const options = new Options(
      { one: 0, two: 0 },
      {
        options: { one: { shortFlag: '-o' }, two: { shortFlag: 't' } },
        filePathArg: {
          longFlag: '--file',
          shortFlag: 'f',
        },
      }
    );
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
    const options = new Options(
      { firstfirst: 0, secondSecond: 0, Thirdthird: 0 },
      {
        options: {
          firstfirst: { shortFlag: '-f' },
          secondSecond: { shortFlag: '---second' },
        },
        decamelize: true,
        filePathArg: {
          longFlag: '--file',
        },
      }
    );
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
