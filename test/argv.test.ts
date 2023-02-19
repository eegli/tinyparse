import { ArgvParser } from '../src/argv';

describe('Argv transformer', () => {
  it('parses empty', () => {
    const parser = new ArgvParser({});
    expect(parser.transform([])).toStrictEqual([{}, []]);
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
      expect(parser.transform(argv)).toStrictEqual([
        {
          boolProp1: true,
          stringProp: 'hello from node',
          numProp: '123',
          boolProp2: true,
        },
        [],
      ]);
    });
  });
  it('ignores invalid flags', () => {
    const parser = new ArgvParser({});
    const transformed = parser.transform([
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
      '--doubleQuotes',
      "'-this is a string'",
    ]);
    expect(transformed).toStrictEqual([
      {
        secret: '123',
        password: 'MyPassword',
        short: 'short',
        bool: true,
        'input-message': 'this is a string',
        sinlgeQuotes: '"-this is a string"',
        doubleQuotes: "'-this is a string'",
      },
      ['positional_1', 'positional_2'],
    ]);
  });
});

describe('Argv transformer with options', () => {
  it('parses from simple JSON files', () => {
    const parser = new ArgvParser({});
    const transformed = parser.transform(
      ['--config', 'test/config.json'],

      { longFlag: 'config' }
    );
    expect(transformed).toStrictEqual([
      {
        username: 'eegli',
        hasGitHubPlus: false,
      },
      [],
    ]);
  });
  it('throws for invalid files', () => {
    const parser = new ArgvParser({});

    expect(() => {
      parser.transform(
        ['--config', 'config.json'],

        { longFlag: 'config' }
      );
    }).toThrow('config.json is not a valid JSON file');
  });
});
