import { ValidationError } from '../src/error';
import { createParser } from '../src/factory';

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
    const c = await parse({});
    expect(c).toStrictEqual(defaultConfig);
  });

  it('returns default config if no args 2', async () => {
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

  it('rejects invalid types', async () => {
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
  });
});

describe('Parsing with options', () => {
  const defaultConfig: Config = {
    stringProp: 'overwrite me',
    boolProp: true,
    numProp: 999,
    undefinedProp: undefined,
  };

  it('resolves if all required args are present', async () => {
    const { parse } = createParser(defaultConfig, [
      {
        name: 'stringProp',
        required: true,
      },
    ]);
    await expect(parse({ stringProp: 'goodbye' })).resolves.toStrictEqual({
      ...defaultConfig,
      stringProp: 'goodbye',
    });
  });

  it('rejects for missing required args', async () => {
    const { parse } = createParser(defaultConfig, [
      {
        name: 'stringProp',
        required: true,
      },
    ]);
    await expect(parse()).rejects.toThrow('"stringProp" is required');
  });

  it('allows null values if specified', async () => {
    const { parse } = createParser(defaultConfig, [
      {
        name: 'stringProp',
        allowNull: true,
      },
    ]);
    const input = { stringProp: null };
    await expect(parse(input)).resolves.toStrictEqual({
      ...defaultConfig,
      stringProp: null,
    });
  });

  it('rejects null values if not specified', async () => {
    const { parse } = createParser(defaultConfig, [
      {
        name: 'stringProp',
      },
    ]);
    const input = { stringProp: null };
    await expect(parse(input)).rejects.toThrow();
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
