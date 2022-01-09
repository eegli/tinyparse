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

  it('overwrites all default values 1', async () => {
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

  it('warns for invalid options', async () => {
    // @ts-expect-error - test input
    await createConfig({ foo: true });
    expect(warner).toHaveBeenCalledTimes(1);
    expect(warner).toHaveBeenCalledWith('Ignoring unknown argument "foo"');
  });

  it('reject for for invalid types 1', async () => {
    expect.assertions(2);
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
  });

  it('reject for for invalid types 2', async () => {
    expect.assertions(2);
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

  const createConfigOne = parserFactory(defaultConfig, {
    required: ['stringProp'],
  });

  const createConfigTwo = parserFactory(defaultConfig, {
    required: ['stringProp', 'numProp'],
  });

  it('resolves if all required args are present', async () => {
    const config = { stringProp: 'hello', boolProp: false };
    await expect(createConfigOne(config)).resolves.toStrictEqual({
      stringProp: 'hello',
      boolProp: false,
      numProp: 999,
      undefinedProp: undefined,
    });
  });

  it('rejects early for partially missing required args', async () => {
    expect.assertions(2);
    try {
      await createConfigOne();
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty(
        'message',
        'Missing required property "stringProp"'
      );
    }
  });

  it('rejects early for all missing required args', async () => {
    expect.assertions(2);
    try {
      await createConfigTwo();
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty(
        'message',
        'Missing required properties "stringProp", "numProp"'
      );
    }
  });

  it('rejects late for partially missing required args', async () => {
    expect.assertions(2);
    try {
      await createConfigTwo({ stringProp: 'new' });
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty(
        'message',
        'Missing required property "numProp"'
      );
    }
  });

  it('rejects late for all missing required args', async () => {
    expect.assertions(2);
    try {
      await createConfigTwo({ boolProp: true });
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty(
        'message',
        'Missing required properties "stringProp", "numProp"'
      );
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
      required: ['stringProp'],
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
