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
