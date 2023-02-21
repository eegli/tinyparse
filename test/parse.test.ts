import { createParser } from '../src';
import { ValidationError } from '../src/error';
import { Parser } from '../src/parser';
import { Value } from '../src/types';

jest.mock('fs');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Parsing with options', () => {
  const defaultValues = {
    stringProp: '',
    boolProp: false,
    numProp: Infinity,
  };

  const positionalArgs = {
    _: [],
  };

  it('sync and async parsing are equal', async () => {
    const { parseSync, parse } = createParser(defaultValues);
    const input = ['--stringProp', 'hello'];
    expect(parseSync(input)).toStrictEqual({
      ...defaultValues,
      ...positionalArgs,
      stringProp: 'hello',
    });
    await expect(parse()).resolves.toStrictEqual(parseSync());
    await expect(parse(input)).resolves.toStrictEqual(parseSync(input));
  });

  it('resolves if all required args are present', async () => {
    const { parse } = createParser(defaultValues, {
      options: {
        stringProp: {
          required: true,
        },
      },
    });
    await expect(parse(['--stringProp', 'hello'])).resolves.toStrictEqual({
      ...defaultValues,
      ...positionalArgs,
      stringProp: 'hello',
    });
  });

  it('parses strings to integers iif types match', async () => {
    const { parse } = createParser(defaultValues);
    await expect(
      parse(['--numProp', '1', '--stringProp', '1'])
    ).resolves.toStrictEqual({
      ...defaultValues,
      ...positionalArgs,
      stringProp: '1',
      numProp: 1,
    });
  });

  it('rejects invalid types 1', async () => {
    const { parse } = createParser(defaultValues);
    expect.assertions(2);
    try {
      await parse(['--boolProp', '1']);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty(
        'message',
        `Invalid type for --boolProp. "1" is not a boolean`
      );
    }
  });

  it('rejects invalid types 2', async () => {
    const { parse } = createParser(defaultValues);
    expect.assertions(2);
    try {
      await parse(['--numProp', 'twelve']);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty(
        'message',
        `Invalid type for --numProp. "twelve" is not a number`
      );
    }
  });

  it('rejects invalid types 3', async () => {
    const { parse } = createParser(defaultValues);
    expect.assertions(2);
    try {
      await parse(['--numProp']);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty(
        'message',
        `Invalid type for --numProp. "true" is not a number`
      );
    }
  });

  it('rejects for missing required args 1', async () => {
    const { parse } = createParser(defaultValues, {
      options: {
        stringProp: {
          required: true,
        },
      },
    });
    expect.assertions(2);
    try {
      await parse([]);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty('message', 'Missing required flag --stringProp');
    }
  });

  it('rejects for missing required args 2', async () => {
    const { parse } = createParser(defaultValues, {
      options: {
        stringProp: {
          longFlag: 'my-string-prop',
          required: true,
        },
      },
    });
    expect.assertions(2);
    try {
      await parse([]);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty(
        'message',
        'Missing required flag --my-string-prop'
      );
    }
  });

  it('allows custom validation', async () => {
    const { parse } = createParser(defaultValues, {
      options: {
        numProp: {
          required: true,
          customValidator: {
            isValid(v): v is Value {
              return typeof v === 'number' && v === 69;
            },
            errorMessage: () => "whoops this shouldn't happen",
          },
        },
      },
    });

    await expect(parse(['--numProp', '69'])).resolves.toStrictEqual({
      ...defaultValues,
      ...positionalArgs,
      numProp: 69,
    });
  });

  it('rejects for failed custom validation', async () => {
    const { parse } = createParser(defaultValues, {
      options: {
        stringProp: {
          required: true,
          longFlag: 'my-string-prop',
          customValidator: {
            isValid(v): v is Value {
              return typeof v === 'string' && v === 'hello';
            },
            errorMessage: (v, f) => `did get "${v}" for ${f}, expected hello`,
          },
        },
      },
    });
    expect.assertions(2);
    try {
      await parse(['--my-string-prop', 'goodbye']);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty(
        'message',
        'did get "goodbye" for --my-string-prop, expected hello'
      );
    }
  });
});

describe('Appens content from JSON file', () => {
  const defaultValues = {
    username: '',
    hasGitHubPlus: false,
    numProp: Infinity,
  };

  // FS mocks have been setup in ./test/_setup.ts
  it('identity when no flags are given', () => {
    const input = new Map([['--file', 'test/long.json']]);
    const content = new Parser(defaultValues).appendFromFile(input);
    expect(content).toStrictEqual(input);
  });
  it('from long flag', () => {
    const content = new Parser(defaultValues).appendFromFile(
      new Map([['--file', 'test/long.json']]),
      'file'
    );
    expect(content).toMatchInlineSnapshot(`
      Map {
        "--from" => "long-flag",
      }
    `);
  });
  it('from short flag', () => {
    const content = new Parser(defaultValues).appendFromFile(
      new Map([['-f', 'test/short.json']]),
      'file',
      'f'
    );
    expect(content).toMatchInlineSnapshot(`
      Map {
        "--from" => "short-flag",
      }
    `);
  });
  it('long flag takes precedence', () => {
    const content = new Parser(defaultValues).appendFromFile(
      new Map([
        ['-f', 'test/short.json'],
        ['--file', 'test/long.json'],
      ]),
      'file',
      'f'
    );
    expect(content).toMatchInlineSnapshot(`
      Map {
        "--from" => "long-flag",
      }
    `);
  });
  it('throws for invalid files', () => {
    expect(() => {
      new Parser(defaultValues).appendFromFile(
        new Map([['-f', 'test/doesnotexist.json']]),
        'file',
        'f'
      );
    }).toThrow('test/doesnotexist.json is not a valid JSON file');
  });
});
