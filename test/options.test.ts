import { Options } from '../src/options';

describe('Options', () => {
  test('Initial key merging', () => {
    const opt1 = new Options(['a', 'b', 'c']);
    const opt2 = new Options([], {
      options: { a: {}, b: {}, c: {} },
    });
    expect([...opt1.keys()]).toStrictEqual(['a', 'b', 'c']);
    expect([...opt2.keys()]).toStrictEqual([]);
  });
  test('entries', () => {
    let options = new Options(['b', 'c']);
    expect(options.get('a')).toStrictEqual({});

    options = new Options(['a', 'b'], {
      options: { a: { description: 'void' }, x: {} },
    });
    expect(options.get('a')).toStrictEqual({ description: 'void' });
    expect([...options.entries()]).toStrictEqual([
      ['a', { description: 'void' }],
      ['b', {}],
    ]);
  });
  test('aliases', () => {
    const options = new Options(['first', 'secondSecond', 'thirdthird'], {
      options: { first: { shortFlag: '-f' } },
      decamelize: true,
      filePathFlag: {
        longFlag: '--file',
      },
    });
    expect(options.shouldDecamelize).toBeTruthy();
    expect(options.filePathFlag).toStrictEqual({ longFlag: '--file' });
    expect(options.aliases).toStrictEqual(
      new Map([
        ['-f', 'first'],
        ['second-second', 'secondSecond'],
      ])
    );
  });
});
