import { Options } from '../src/options';

describe('Options', () => {
  test('initialization', () => {
    let options = new Options({}, ['b', 'c']);
    expect(options.get('a')).toStrictEqual({});

    options = new Options({ a: { description: 'void' }, x: {} }, ['a', 'b']);
    expect(options.get('a')).toStrictEqual({ description: 'void' });
    expect([...options.entries()]).toStrictEqual([
      ['a', { description: 'void' }],
      ['b', {}],
    ]);

    options = new Options({ a: { description: 'void' } }, ['a', 'b'], {
      decamelize: true,
      filePathArg: {
        longFlag: '--file',
      },
    });
    expect(options.shouldDecamelize).toBeTruthy();
    expect(options.filePathArg).toStrictEqual({ longFlag: '--file' });
  });
});
