import { createParser } from '../src';
import { ValidationError } from '../src/error';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Object literal parsing', () => {
  const defaultValues = {
    stringProp: 'string',
    boolProp: false,
    numProp: 999,
  };

  const { parse } = createParser(defaultValues);

  it('returns default config if no args', async () => {
    const c1 = await parse();
    expect(c1).toStrictEqual(defaultValues);
  });

  it('overwrites default values', async () => {
    const c1 = await parse({
      stringProp: 'hello',
      boolProp: true,
      numProp: 69,
    });
    expect(c1).toStrictEqual({
      stringProp: 'hello',
      boolProp: true,
      numProp: 69,
    });
    const c2 = await parse({
      stringProp: 'hello',
    });
    expect(c2).toStrictEqual({
      ...defaultValues,
      stringProp: 'hello',
    });
  });

  it('ignores unknown args', async () => {
    const c = await parse({
      unknownProp: 'hello',
    } as unknown as typeof defaultValues);
    expect(c).toStrictEqual({
      ...defaultValues,
    });
  });

  it('rejects invalid types', async () => {
    expect.assertions(2);
    try {
      await parse({ boolProp: {} } as unknown as typeof defaultValues);
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
    stringProp: '',
    boolProp: true,
    numProp: 1,
  };

  it('resolves if all required args are present', async () => {
    const { parse } = createParser(defaultValues, {
      options: {
        stringProp: {
          required: true,
        },
      },
    });
    const input1 = { stringProp: 'hello' };
    const input2 = ['--stringProp', 'hello'];
    const expected = {
      ...defaultValues,
      stringProp: 'hello',
    };

    await expect(parse(input1)).resolves.toStrictEqual(expected);
    await expect(parse(input2)).resolves.toStrictEqual(expected);
  });

  it('allows custom validation', async () => {
    const { parse } = createParser(defaultValues, {
      options: {
        numProp: {
          required: true,
          customValidator: {
            isValid: (v) => typeof v === 'number' && v === 0,
            errorMessage: () => "whoops this shouldn't happen",
          },
        },
      },
    });
    const input1 = ['--numProp', '0'];
    const input2 = { numProp: 0 };
    const expected = {
      ...defaultValues,
      numProp: 0,
    };
    await expect(parse(input1)).resolves.toStrictEqual(expected);
    await expect(parse(input2)).resolves.toStrictEqual(expected);
  });

  it('parses strings to integers iif types match', async () => {
    const { parse } = createParser(defaultValues);
    const input = ['--numProp', '1', '--stringProp', '1'];
    const expected = {
      ...defaultValues,
      stringProp: '1',
      numProp: 1,
    };
    await expect(parse(input)).resolves.toStrictEqual(expected);
  });

  it('rejects for missing required args', async () => {
    const { parse } = createParser(defaultValues, {
      options: {
        stringProp: {
          required: true,
        },
      },
    });
    expect.assertions(2);
    try {
      await parse({});
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty('message', '"stringProp" is required');
    }
  });

  it('rejects for failed custom validation', async () => {
    const { parse } = createParser(defaultValues, {
      options: {
        stringProp: {
          required: true,
          customValidator: {
            isValid: (v) => v === 'hello',
            errorMessage: (v) => `did get "${v}", expected hello`,
          },
        },
      },
    });
    expect.assertions(2);
    try {
      await parse({ stringProp: 'goodbye' });
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty('message', 'did get "goodbye", expected hello');
    }
  });
});
