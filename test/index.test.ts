import { configFactory } from '../src/creator';

type Config = {
  stringProp: string;
  boolProp: boolean;
  numProp: number;
};

const warner = jest.spyOn(global.console, 'warn').mockImplementation(jest.fn());

beforeEach(() => {
  jest.clearAllMocks();
});

const defaultConfig: Config = {
  stringProp: 'string',
  boolProp: false,
  numProp: 999,
};

describe('Programmatic creation', () => {
  const createConfig = configFactory(defaultConfig);

  it('returns default config if no args 1', async () => {
    const c = await createConfig();
    expect(c).toStrictEqual(defaultConfig);
  });

  it('returns default config if no args 2', async () => {
    const c = await createConfig({});
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

  it(`converts string to num if valid`, async () => {
    const c = await createConfig({
      stringProp: 'string',
      boolProp: false,
      numProp: '1',
    } as unknown as Config); // TS would complain for invalid input
    expect(c).toHaveProperty('numProp', 1);
  });

  it(`warns for invalid options`, async () => {
    // @ts-expect-error - test input
    await createConfig({ foo: true });
    expect(warner).toHaveBeenCalledTimes(1);
    expect(warner).toHaveBeenCalledWith('Ignoring unknown option "foo"');
  });
  it(`reject for for invalid types`, async () => {
    await expect(
      // @ts-expect-error - test input
      createConfig({ boolProp: {} })
    ).rejects.toEqual(
      'Invalid type for option "boolProp". Expected boolean, got object'
    );
  });
});

describe('Argv parsing', () => {
  const createConfig = configFactory(defaultConfig);
  it('returns default config if no args', async () => {
    const c = await createConfig([]);
    expect(c).toStrictEqual(defaultConfig);
  });

  it('overwrites all default values 1', async () => {
    const c = await createConfig([
      '--stringProp',
      'str',
      '--boolProp',
      '--numProp',
      '123',
    ]);
    expect(c).toStrictEqual<Config>({
      stringProp: 'str',
      boolProp: true,
      numProp: 123,
    });
  });
  it('spreads in default config opts', async () => {
    const c = await createConfig(['--stringProp', 'str']);
    expect(c).toStrictEqual<Config>({ ...defaultConfig, stringProp: 'str' });
  });
});
