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
        'str',
        '--numProp',
        '123',
        '--boolProp2',
      ],
      options: [],
    },
    {
      argv: [
        '--stringProp',
        'str',
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
        'str',
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
        'str',
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
        stringProp: 'str',
        numProp: 123,
        boolProp2: true,
      });
    });
  });
});

describe('Argv transformer with short flags', () => {
  it('ignores short flags that are not present', async () => {
    const c = transformArgv({
      argv: ['-s', '123', '--input', '123s', '-p', 'mypw', '-x', 'donotparse'],
      options: [
        { name: 'secret', shortFlag: '-s' },
        { name: 'password', shortFlag: '-p' },
      ],
    });
    expect(c).toStrictEqual({
      secret: 123,
      password: 'mypw',
      input: '123s',
    });
  });
  it('can have both long and short flags', async () => {
    const c = transformArgv({
      argv: ['-s', '123', '--input', 'this is a string', '-p', 'mypw'],
      options: [
        { name: 'secret', shortFlag: '-s' },
        { name: 'password', shortFlag: '-p' },
      ],
    });
    expect(c).toStrictEqual({
      secret: 123,
      password: 'mypw',
      input: 'this is a string',
    });
  });
  it('transforms boolean short flags', async () => {
    const c = transformArgv({
      argv: ['--long', '-v', '--normal', 'value'],
      options: [{ name: 'verbose', shortFlag: '-v' }],
    });
    expect(c).toStrictEqual({
      verbose: true,
      long: true,
      normal: 'value',
    });
  });
  it('transforms empty', async () => {
    const c = transformArgv({ argv: ['-s', '123'], options: [] });
    expect(c).toStrictEqual({});
  });
});

describe('Argv transformer with file parsing', () => {
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
