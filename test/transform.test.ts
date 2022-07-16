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
    expect(res).toStrictEqual([
      {
        name: 'test',
        required: true,
      },
      {
        description: 'another property',
        name: 'test2',
      },
    ]);
    expect(transformOptions({})).toStrictEqual([]);
    expect(transformOptions()).toStrictEqual([]);
  });
});

describe('Argv transformer', () => {
  it('parses empty', async () => {
    const c = transformArgv({ argv: [], options: [] });
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
      options: [],
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
      options: [],
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
      options: [],
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
      options: [],
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
  it('supports long and short flags', async () => {
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
      options: [
        { name: 'secret', shortFlag: '-s' },
        { name: 'password', shortFlag: '-p' },
      ],
    });
    expect(c).toStrictEqual({
      secret: 123,
      password: 'MyPassword',
      donotignore: true,
      input: 'this is a string',
    });
  });
  it('transforms empty', async () => {
    const c = transformArgv({ argv: ['-s', '123'], options: [] });
    expect(c).toStrictEqual({});
  });
  it('parses from simple JSON files', async () => {
    transformArgv({ argv: [], options: [] });
    const c = transformArgv({
      argv: ['--config', 'test/config.json'],
      options: [],
      filePathFlag: '--config',
    });
    expect(c).toStrictEqual({
      username: 'eegli',
    });
  });
  it('throws for invalid files', async () => {
    transformArgv({ argv: [], options: [] });
    expect(() => {
      transformArgv({
        argv: ['--config', 'config.json'],
        options: [],
        filePathFlag: '--config',
      });
    }).toThrow('config.json is not a valid JSON file');
  });
});
