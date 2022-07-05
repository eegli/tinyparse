import { ValidationError } from '../src/error';
import { createParser, transformOptions } from '../src/factory';

describe('Transformer', () => {
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
    expect(res).toMatchInlineSnapshot(`
      [
        {
          "name": "test",
          "required": true,
        },
        {
          "description": "another property",
          "name": "test2",
        },
      ]
    `);
  });
});

describe('Parsing', () => {
  const defaultConfig = {
    stringProp: 'string',
    boolProp: false,
    numProp: 999,
  };
  const { parse } = createParser(defaultConfig);

  it('returns default config if no args', async () => {
    const c1 = await parse({});
    expect(c1).toStrictEqual(defaultConfig);
    const c2 = await parse([]);
    expect(c2).toStrictEqual(defaultConfig);
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

  it('ignores unknown args', async () => {
    // @ts-expect-error test input
    const c = await parse({ unknownProp: 'hello' });
    expect(c).toStrictEqual({
      ...defaultConfig,
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
  const defaultConfig = {
    stringProp: 'overwrite me',
    boolProp: true,
    numProp: 999,
  };

  it('resolves if all required args are present', async () => {
    const { parse } = createParser(defaultConfig, {
      options: {
        stringProp: {
          required: true,
        },
      },
    });
    await expect(parse({ stringProp: 'goodbye' })).resolves.toStrictEqual({
      ...defaultConfig,
      stringProp: 'goodbye',
    });
  });

  it('rejects for missing required args', async () => {
    const { parse } = createParser(defaultConfig, {
      options: {
        stringProp: {
          required: true,
        },
      },
    });
    await expect(parse()).rejects.toThrow('"stringProp" is required');
  });
});

describe('Parsing with string args', () => {
  type Config = {
    stringProp: string;
    boolProp: boolean;
    numProp: number;
  };

  const defaultConfig = {
    stringProp: 'overwrite me',
    boolProp: false,
    numProp: 999,
  };
  it('works with required', async () => {
    const { parse } = createParser<Config>(defaultConfig, {
      options: {
        stringProp: {
          required: true,
        },
      },
    });
    const c = await parse(['--stringProp', 'new value!', '--boolProp']);
    expect(c).toStrictEqual({
      stringProp: 'new value!',
      boolProp: true,
      numProp: 999,
    });
  });
  it('works with shortmap', async () => {
    const { parse } = createParser<Config>(defaultConfig, {
      options: {
        stringProp: {
          shortFlag: '-s',
        },
        boolProp: {
          shortFlag: '-b',
        },
      },
    });

    const c = await parse(['-s', 'new value!', '-b']);
    expect(c).toStrictEqual({
      stringProp: 'new value!',
      boolProp: true,
      numProp: 999,
    });
  });
});
