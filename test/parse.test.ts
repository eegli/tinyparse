import { ValidationError } from '../src/error';
import { parseObjectLiteral as parse } from '../src/parse';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Object literal parsing', () => {
  const defaultValues = {
    stringProp: 'string',
    boolProp: false,
    numProp: 999,
  };

  it('returns default config if no args', async () => {
    const c1 = await parse({ defaultValues, input: {} });
    expect(c1).toStrictEqual(defaultValues);
  });

  it('overwrites default values', async () => {
    const c1 = await parse({
      defaultValues,
      input: {
        stringProp: 'hello',
        boolProp: true,
        numProp: 69,
      },
    });
    expect(c1).toStrictEqual({
      stringProp: 'hello',
      boolProp: true,
      numProp: 69,
    });
    const c2 = await parse({
      defaultValues,
      input: {
        stringProp: 'hello',
      },
    });
    expect(c2).toStrictEqual({
      ...defaultValues,
      stringProp: 'hello',
    });
  });

  it('ignores unknown args', async () => {
    const c = await parse({
      defaultValues,
      input: { unknownProp: 'hello' } as unknown as typeof defaultValues,
    });
    expect(c).toStrictEqual({
      ...defaultValues,
    });
  });

  it('rejects invalid types', async () => {
    expect.assertions(2);
    try {
      await parse({
        defaultValues,
        input: { boolProp: {} } as unknown as typeof defaultValues,
      });
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
  const defaultValues = {
    stringProp: 'overwrite me',
    boolProp: true,
    numProp: 999,
  };

  it('resolves if all required args are present', async () => {
    const args: Parameters<typeof parse>[0] = {
      defaultValues,
      input: { stringProp: 'goodbye' },
      options: new Map([
        [
          'stringProp',
          {
            name: 'stringProp',
            required: true,
            customValidator: {
              validate: (v) => typeof v === 'string',
              reason: () => "whoops this shouldn't happen",
            },
          },
        ],
      ]),
    };
    await expect(parse(args)).resolves.toStrictEqual({
      ...defaultValues,
      stringProp: 'goodbye',
    });
  });

  it('rejects for missing required args', async () => {
    expect.assertions(2);
    const args: Parameters<typeof parse>[0] = {
      defaultValues,
      input: {},
      options: new Map([
        ['stringProp', { name: 'stringProp', required: true }],
      ]),
    };
    try {
      await parse(args);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty('message', '"stringProp" is required');
    }
  });

  it('rejects for failed custom validation', async () => {
    expect.assertions(2);
    const args: Parameters<typeof parse>[0] = {
      defaultValues,
      input: { stringProp: 'goodbye' },
      options: new Map([
        [
          'stringProp',
          {
            name: 'stringProp',
            required: true,
            customValidator: {
              validate: (v) => v === 'hello',
              reason: (v) => `did get "${v}", expected hello`,
            },
          },
        ],
      ]),
    };
    try {
      await parse(args);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty('message', 'did get "goodbye", expected hello');
    }
  });
});
