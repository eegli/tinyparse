import { ArgvParser } from '../src/argv';

describe('Argv transformer', () => {
  it('parses empty', () => {
    const parser = new ArgvParser({});
    expect(parser.transform([], { aliases: new Map() })).toStrictEqual([
      {},
      [],
    ]);
  });

  const orders = [
    {
      argv: [
        '--boolProp1',
        '--stringProp',
        'hello from node',
        '--numProp',
        '123',
        '--boolProp2',
      ],
    },
    {
      argv: [
        '--stringProp',
        'hello from node',
        '--boolProp1',
        '--boolProp2',
        '--numProp',
        '123',
      ],
    },
    {
      argv: [
        '--boolProp1',
        '--numProp',
        '123',
        '--stringProp',
        'hello from node',
        '--boolProp2',
      ],
    },
    {
      argv: [
        '--numProp',
        '123',
        '--boolProp1',
        '--stringProp',
        'hello from node',
        '--boolProp2',
      ],
    },
  ];
  orders.forEach((variant, idx) => {
    it('works with order ' + idx, () => {
      const parser = new ArgvParser({});
      expect(
        parser.transform(variant.argv, {
          aliases: new Map(),
        })
      ).toStrictEqual([
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
});

describe('Argv transformer with options', () => {
  it('supports long and short flags', () => {
    const parser = new ArgvParser({});

    const transformed = parser.transform(
      [
        'positional_1',
        'positional_2',
        '-thisisignored',
        'thisisignored',
        '--secret',
        '123',
        '--input-message',
        'this is a string',
        '--notignored',
        '-p',
        'xyz123',
        '-p',
        'MyPassword',
        'thisisignored',
        '--sinlgeQuotes',
        '"-this is a string"',
        '--doubleQuotes',
        "'-this is a string'",
      ],
      {
        aliases: new Map([
          ['-p', 'password'],
          ['--input-message', 'inputMessage'],
        ]),
      }
    );
    expect(transformed).toStrictEqual([
      {
        secret: '123',
        password: 'MyPassword',
        notignored: true,
        inputMessage: 'this is a string',
        sinlgeQuotes: '"-this is a string"',
        doubleQuotes: "'-this is a string'",
      },
      ['positional_1', 'positional_2'],
    ]);
  });
  it('parses from simple JSON files', () => {
    const parser = new ArgvParser({});
    const transformed = parser.transform(['--config', 'test/config.json'], {
      aliases: new Map([['-p', '--password']]),
      filePathFlag: '--config',
    });
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
      parser.transform(['--config', 'config.json'], {
        aliases: new Map([['-p', '--password']]),
        filePathFlag: '--config',
      });
    }).toThrow('config.json is not a valid JSON file');
  });
});
