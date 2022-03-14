import { ValidationError } from '../src/error';
import { createParser } from '../src/factory';

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
  const { parse } = createParser(defaultConfig);

  it('returns default config if no args 1', async () => {
    const c = await parse();
    expect(c).toStrictEqual(defaultConfig);
  });

  it('returns default config if no args 2', async () => {
    const c = await parse({});
    expect(c).toStrictEqual(defaultConfig);
  });

  it('returns default config if no args 3', async () => {
    const c = await parse([]);
    expect(c).toStrictEqual(defaultConfig);
  });

  it('overwrites all default values', async () => {
    const c = await parse({
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
    const c = await parse({ stringProp: 'hello' });
    expect(c).toStrictEqual({
      ...defaultConfig,
      stringProp: 'hello',
    });
  });

  it('warns with invalid options', async () => {
    // @ts-expect-error - test input
    await parse({ foo: true });
    expect(warner).toHaveBeenCalledTimes(1);
    expect(warner).toHaveBeenCalledWith('Ignoring unknown argument "foo"');
  });

  it('rejects invalid types', async () => {
    expect.assertions(4);
    try {
      // @ts-expect-error - test input
      await parse({ boolProp: {} });
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty(
        'message',
        'Invalid type for "boolProp". Expected boolean, got object'
      );
    }
    try {
      await parse({
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
  const { parse: parseWithStringRequired } = createParser(defaultConfig, [
    {
      name: 'stringProp',
      required: true,
    },
  ]);

  const { parse: parseWithStringAndNumRequired } = createParser(defaultConfig, [
    {
      name: 'stringProp',
      required: true,
    },
    {
      name: 'numProp',
      required: true,
    },
  ]);

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
      expect(e).toHaveProperty('message', '"stringProp" is required');
    }
    try {
      await parseWithStringAndNumRequired();
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty('message', '"stringProp" is required');
    }
  });

  it('rejects late for missing required args', async () => {
    expect.assertions(4);
    try {
      await parseWithStringRequired({});
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty('message', '"stringProp" is required');
    }
    try {
      await parseWithStringAndNumRequired({ stringProp: 'bonjour' });
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty('message', '"numProp" is required');
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
    const { parse } = createParser<Config>(defaultConfig, [
      {
        name: 'stringProp',
        required: true,
      },
    ]);
    const c = await parse(['--stringProp', 'new value!', '--boolProp']);
    expect(c).toStrictEqual({
      stringProp: 'new value!',
      boolProp: true,
      numProp: 999,
    });
  });
  it('works with shortmap', async () => {
    const { parse } = createParser<Config>(defaultConfig, [
      { name: 'stringProp', shortFlag: '-s' },
      {
        name: 'boolProp',
        shortFlag: '-b',
      },
    ]);

    const c = await parse(['-s', 'new value!', '-b']);
    expect(c).toStrictEqual({
      stringProp: 'new value!',
      boolProp: true,
      numProp: 999,
    });
  });
});
