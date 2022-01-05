import { configFactory } from '../src/parse';

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
  const createConfig = configFactory(defaultConfig);

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
    expect(warner).toHaveBeenCalledWith('Ignoring unknown option "foo"');
  });
  it('reject for for invalid types 1', async () => {
    await expect(
      // @ts-expect-error - test input
      createConfig({ boolProp: {} })
    ).rejects.toBe(
      'Invalid type for option "boolProp". Expected boolean, got object'
    );
  });
  it('reject for for invalid types 2', async () => {
    await expect(
      createConfig({
        stringProp: 'string',
        boolProp: false,
        numProp: '1',
      } as unknown as Config) // TS would complain for invalid input
    ).rejects.toBe(
      'Invalid type for option "numProp". Expected number, got string'
    );
  });
});

describe('Parsing with required args', () => {
  const defaultConfig: Config = {
    stringProp: 'overwrite me',
    boolProp: true,
    numProp: 999,
    undefinedProp: undefined,
  };

  const createConfigOne = configFactory(defaultConfig, {
    required: ['stringProp'],
  });

  const createConfigTwo = configFactory(defaultConfig, {
    required: ['stringProp', 'numProp'],
  });

  // With undefined prop as required
  const createConfig3 = configFactory(defaultConfig, {
    required: ['undefinedProp'],
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

  it('rejects for all missing required args 1', async () => {
    await expect(createConfigOne()).rejects.toBe(
      'Missing required config property "stringProp"'
    );
  });

  it('rejects for all missing required args 2', async () => {
    await expect(createConfigTwo()).rejects.toBe(
      'Missing required config properties "stringProp, numProp"'
    );
  });

  it('rejects for partially missing required args', async () => {
    const config = { stringProp: 'new' };
    await expect(createConfigTwo(config)).rejects.toBe(
      'Missing required config property "numProp"'
    );
  });
});
