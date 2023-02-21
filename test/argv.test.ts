import { ArgvParser } from '../src/argv';

describe('Argv transformer', () => {
  it('parses empty', () => {
    const parser = new ArgvParser({});
    expect(parser.transform([])).toStrictEqual([new Map(), []]);
  });

  const orders = [
    [
      '--boolProp1',
      '--stringProp',
      'hello from node',
      '--numProp',
      '123',
      '--boolProp2',
    ],
    [
      '--stringProp',
      'hello from node',
      '--boolProp1',
      '--boolProp2',
      '--numProp',
      '123',
    ],
    [
      '--boolProp1',
      '--numProp',
      '123',
      '--stringProp',
      'hello from node',
      '--boolProp2',
    ],
    [
      '--numProp',
      '123',
      '--boolProp1',
      '--stringProp',
      'hello from node',
      '--boolProp2',
    ],
  ];
  orders.forEach((argv, idx) => {
    it('works with order ' + idx, () => {
      const parser = new ArgvParser({});
      const [transformed, positionals] = parser.transform(argv);

      expect(Object.fromEntries(transformed)).toStrictEqual({
        '--boolProp1': true,
        '--stringProp': 'hello from node',
        '--numProp': '123',
        '--boolProp2': true,
      });
      expect(positionals).toStrictEqual([]);
    });
  });
  it('ignores invalid flags', () => {
    const parser = new ArgvParser({});
    const [transformed, positionals] = parser.transform([
      'positional_1',
      'positional_2',
      '-short',
      'short',
      '--secret',
      '123',
      '--input-message',
      'this is a string',
      '--bool',
      '--password',
      'xyz123',
      '--password',
      'MyPassword',
      'thisisignored',
      '--sinlgeQuotes',
      '"-this is a string"',
      '-doubleQuotes',
      "'-this is a string'",
      '--array',
      '[1,2,3]',
    ]);
    expect(Object.fromEntries(transformed)).toStrictEqual({
      '--secret': '123',
      '--password': 'MyPassword',
      '-short': 'short',
      '--bool': true,
      '--input-message': 'this is a string',
      '--sinlgeQuotes': '"-this is a string"',
      '-doubleQuotes': "'-this is a string'",
      '--array': '[1,2,3]',
    }),
      expect(positionals).toStrictEqual(['positional_1', 'positional_2']);
  });
});
