import { transformArgv, transformOptions } from '../src/transform';

describe('External options transformer', () => {
  test('transforms options to internal structure', () => {
    const res = transformOptions({
      options: {
        testOne: {
          required: true,
        },
        testTwo: {
          description: 'another property',
        },
      },
    });
    expect(res).toStrictEqual(
      new Map([
        [
          'testOne',
          {
            name: 'testOne',
            required: true,
          },
        ],
        [
          'testTwo',
          {
            name: 'testTwo',
            description: 'another property',
          },
        ],
      ])
    );
    expect(transformOptions({})).toStrictEqual(new Map());
    expect(transformOptions()).toStrictEqual(new Map());
  });
  test('respects decamelize option', () => {
    const res = transformOptions({
      decamelize: true,
      options: {
        testOne: {},
        testTwo: {},
      },
    });
    expect(res).toStrictEqual(
      new Map([
        [
          'testOne',
          {
            name: 'testOne',
            decamelizedKey: 'test-one',
          },
        ],
        [
          'testTwo',
          {
            name: 'testTwo',
            decamelizedKey: 'test-two',
          },
        ],
      ])
    );
    expect(transformOptions({})).toStrictEqual(new Map());
    expect(transformOptions()).toStrictEqual(new Map());
  });
});

describe('Argv transformer', () => {
  it('parses empty', () => {
    const c = transformArgv({ argv: [] });
    expect(c).toStrictEqual([{}, []]);
  });

  const orders: Parameters<typeof transformArgv>[0][] = [
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
      expect(
        transformArgv({
          argv: variant.argv,
          options: variant.options,
          filePathFlag: variant.filePathFlag,
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
  it('transforms empty', () => {
    const c = transformArgv({ argv: ['-s', '123'] });
    expect(c).toStrictEqual([{}, []]);
  });
  it('supports long and short flags', () => {
    const c = transformArgv({
      argv: [
        'positional_1',
        'positional_2',
        '-thisisignored',
        'thisisignored',
        '--secret',
        '123',
        '--input',
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
      options: new Map([['password', { name: 'password', shortFlag: '-p' }]]),
    });
    expect(c).toStrictEqual([
      {
        secret: '123',
        password: 'MyPassword',
        notignored: true,
        input: 'this is a string',
        sinlgeQuotes: '"-this is a string"',
        doubleQuotes: "'-this is a string'",
      },
      ['positional_1', 'positional_2'],
    ]);
  });
  it('parses from simple JSON files', () => {
    transformArgv({ argv: [] });
    const c = transformArgv({
      argv: ['--config', 'test/config.json'],
      filePathFlag: '--config',
    });
    expect(c).toStrictEqual([
      {
        username: 'eegli',
      },
      [],
    ]);
  });
  it('throws for invalid files', () => {
    transformArgv({ argv: [] });
    expect(() => {
      transformArgv({
        argv: ['--config', 'config.json'],
        filePathFlag: '--config',
      });
    }).toThrow('config.json is not a valid JSON file');
  });
});
