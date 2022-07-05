import { ValidationError } from '../src/error';
import { parseObjectLiteral as parse } from '../src/parse';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Object literal parsing', () => {
  const defaultConfig = {
    stringProp: 'string',
    boolProp: false,
    numProp: 999,
  };

  it('returns default config if no args', async () => {
    const c1 = await parse(defaultConfig, {}, []);
    expect(c1).toStrictEqual(defaultConfig);
  });

  it('overwrites default values', async () => {
    const c1 = await parse(
      defaultConfig,
      {
        stringProp: 'hello',
        boolProp: true,
        numProp: 69,
      },
      []
    );
    expect(c1).toStrictEqual({
      stringProp: 'hello',
      boolProp: true,
      numProp: 69,
    });
    const c2 = await parse(defaultConfig, { stringProp: 'hello' }, []);
    expect(c2).toStrictEqual({
      ...defaultConfig,
      stringProp: 'hello',
    });
  });

  it('ignores unknown args', async () => {
    const c = await parse(
      defaultConfig,
      { unknownProp: 'hello' } as unknown as typeof defaultConfig,
      []
    );
    expect(c).toStrictEqual({
      ...defaultConfig,
    });
  });

  it('rejects invalid types', async () => {
    try {
      await parse(
        defaultConfig,
        { boolProp: {} } as unknown as typeof defaultConfig,
        []
      );
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
    const args: Parameters<typeof parse> = [
      defaultConfig,
      { stringProp: 'goodbye' },
      [{ name: 'stringProp', required: true }],
    ];
    await expect(parse(...args)).resolves.toStrictEqual({
      ...defaultConfig,
      stringProp: 'goodbye',
    });
  });

  it('rejects for missing required args', async () => {
    const args: Parameters<typeof parse> = [
      defaultConfig,
      {},
      [{ name: 'stringProp', required: true }],
    ];
    try {
      await parse(...args);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty('message', '"stringProp" is required');
    }
  });
});
