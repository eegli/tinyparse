import { transformArgv, transformOptions } from '../src/transform';

describe('External options transformer', () => {
  test('transforms options to internal structure', () => {
    const res = transformOptions({
      options: {
        test: {
          required: true,
        },
        test2: {
          description: 'another property',
        },
      },
    });
    expect(res).toStrictEqual(
      new Map([
        [
          'test',
          {
            name: 'test',
            required: true,
          },
        ],
        [
          'test2',
          {
            description: 'another property',
            name: 'test2',
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
    expect(c).toStrictEqual({});
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
      ).toStrictEqual({
        boolProp1: true,
        stringProp: 'hello from node',
        numProp: 123,
        boolProp2: true,
      });
    });
  });
});

describe('Argv transformer with options', () => {
  it('supports long and short flags', () => {
    const c = transformArgv({
      argv: [
        '-ignoreme',
        '-s',
        '123',
        '--input',
        'this is a string',
        '--donotignore',
        '-p',
        'xyz123',
        '-p',
        'MyPassword',
      ],
      options: new Map([
        ['secret', { name: 'secret', shortFlag: '-s' }],
        ['password', { name: 'password', shortFlag: '-p' }],
      ]),
    });
    expect(c).toStrictEqual({
      secret: 123,
      password: 'MyPassword',
      donotignore: true,
      input: 'this is a string',
    });
  });
  it('transforms empty', () => {
    const c = transformArgv({ argv: ['-s', '123'] });
    expect(c).toStrictEqual({});
  });
  it('parses from simple JSON files', () => {
    transformArgv({ argv: [] });
    const c = transformArgv({
      argv: ['--config', 'test/config.json'],
      filePathFlag: '--config',
    });
    expect(c).toStrictEqual({
      username: 'eegli',
    });
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
