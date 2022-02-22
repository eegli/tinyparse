import { ValidationError } from '../src/error';
import { parserFactory } from '../src/factory';

const warner = jest.spyOn(global.console, 'warn').mockImplementation(jest.fn());

beforeEach(() => {
  jest.clearAllMocks();
});

type Config = {
  stringProp: string;
  boolProp: boolean;
  numProp: number;
  undefinedProp?: string;
};

describe('Parsing', () => {
  const defaultConfig: Config = {
    stringProp: 'string',
    boolProp: false,
    numProp: 999,
  };
  const createConfig = parserFactory(defaultConfig);

  it('returns default config if no args 1', async () => {
    const c = await createConfig();
    expect(c).toStrictEqual(defaultConfig);
  });

  it('returns default config if no args 2', async () => {
    const c = await createConfig({});
    expect(c).toStrictEqual(defaultConfig);
  });

  it('returns default config if no args 3', async () => {
    const c = await createConfig([]);
    expect(c).toStrictEqual(defaultConfig);
  });

  it('overwrites all default values', async () => {
    const c = await createConfig({
      stringProp: 'hello',
      boolProp: true,
      numProp: 69,
    });
    expect(c).toStrictEqual({
      stringProp: 'hello',
      boolProp: true,
      numProp: 69,
    });
  });

  it('spreads in default config opts', async () => {
    const c = await createConfig({ stringProp: 'hello' });
    expect(c).toStrictEqual({
      ...defaultConfig,
      stringProp: 'hello',
    });
  });

  it('warns with invalid options', async () => {
    // @ts-expect-error - test input
    await createConfig({ foo: true });
    expect(warner).toHaveBeenCalledTimes(1);
    expect(warner).toHaveBeenCalledWith('Ignoring unknown argument "foo"');
  });

  it('rejects invalid types', async () => {
    expect.assertions(4);
    try {
      // @ts-expect-error - test input
      await createConfig({ boolProp: {} });
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty(
        'message',
        'Invalid type for "boolProp". Expected boolean, got object'
      );
    }
    try {
      await createConfig({
        stringProp: 'string',
        boolProp: false,
        numProp: '1',
      } as unknown as Config);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty(
        'message',
        'Invalid type for "numProp". Expected number, got string'
      );
    }
  });
});

describe('Parsing with required args', () => {
  const defaultConfig: Config = {
    stringProp: 'overwrite me',
    boolProp: true,
    numProp: 999,
    undefinedProp: undefined,
  };
  // Pre-made helpers
  const parseWithStringRequired = parserFactory(defaultConfig, {
    required: [
      {
        argName: 'stringProp',
        errorMessage: 'argument "stringProp" is required',
      },
    ],
  });

  const parseWithStringAndNumRequired = parserFactory(defaultConfig, {
    required: [
      {
        argName: 'stringProp',
        errorMessage: 'argument "stringProp" is required',
      },
      {
        argName: 'numProp',
        errorMessage: 'please specify "numProp"',
      },
    ],
  });

  it('resolves if all required args are present', async () => {
    const input = { stringProp: 'goodbye' };
    await expect(parseWithStringRequired(input)).resolves.toStrictEqual({
      ...defaultConfig,
      stringProp: 'goodbye',
    });
  });

  it('rejects early missing required args', async () => {
    expect.assertions(4);
    try {
      await parseWithStringRequired();
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty('message', 'argument "stringProp" is required');
    }
    try {
      await parseWithStringAndNumRequired();
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty('message', 'argument "stringProp" is required');
    }
  });

  it('rejects late for missing required args', async () => {
    expect.assertions(4);
    try {
      await parseWithStringRequired({});
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty('message', 'argument "stringProp" is required');
    }
    try {
      await parseWithStringAndNumRequired({ stringProp: 'bonjour' });
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty('message', 'please specify "numProp"');
    }
  });
});

describe('Parsing with string args', () => {
  const defaultConfig = {
    stringProp: 'overwrite me',
    boolProp: false,
    numProp: 999,
  };
  it('works with required', async () => {
    const createConfig = parserFactory<Config>(defaultConfig, {
      required: [
        {
          argName: 'stringProp',
          errorMessage: 'please make sure "stringProp" is set',
        },
      ],
    });
    const c = await createConfig(['--stringProp', 'new value!', '--boolProp']);
    expect(c).toStrictEqual({
      stringProp: 'new value!',
      boolProp: true,
      numProp: 999,
    });
  });
  it('works with shortmap', async () => {
    const createConfig = parserFactory<Config>(defaultConfig, {
      shortFlags: { '-s': 'stringProp', '-b': 'boolProp' },
    });
    const c = await createConfig(['-s', 'new value!', '-b']);
    expect(c).toStrictEqual({
      stringProp: 'new value!',
      boolProp: true,
      numProp: 999,
    });
  });
});
