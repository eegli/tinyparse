import { transformArgv } from '../src/argv';

describe('Argv transformer', () => {
  test('parses empty', () => {
    expect(transformArgv([])).toStrictEqual([new Map(), []]);
  });

  const orders = [
    [
      '--boolProp1',
      '--stringProp=hello from node',
      '--numProp',
      '123',
      '--boolProp2',
    ],
    [
      '--stringProp',
      'hello from node',
      '--boolProp1',
      '--boolProp2',
      '--numProp=123',
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
    test('works with order ' + idx, () => {
      const [transformed, positionals] = transformArgv(argv);

      expect(Object.fromEntries(transformed)).toStrictEqual({
        '--boolProp1': null,
        '--stringProp': 'hello from node',
        '--numProp': '123',
        '--boolProp2': null,
      });
      expect(positionals).toStrictEqual([]);
    });
  });
  test('ignores invalid flags', () => {
    const [transformed, positionals] = transformArgv([
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
      '--bool': null,
      '--input-message': 'this is a string',
      '--sinlgeQuotes': '"-this is a string"',
      '-doubleQuotes': "'-this is a string'",
      '--array': '[1,2,3]',
    }),
      expect(positionals).toStrictEqual(['positional_1', 'positional_2']);
  });
});
