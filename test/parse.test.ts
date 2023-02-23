import { createParser } from '../src';
import { ValidationError } from '../src/error';
import { Parser } from '../src/parser';
import { Value } from '../src/types';
import { mockFs } from './_setup';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Parsing, with options', () => {
  const defaultValues = {
    stringProp: '',
    boolProp: false,
    numProp: Infinity,
  };

  const positionalArgs = {
    _: [],
  };

  it('resolves if all required args are present', () => {
    const { parseSync } = createParser(defaultValues, {
      options: {
        stringProp: {
          required: true,
        },
      },
    });
    expect(parseSync(['--stringProp', 'hello'])).toStrictEqual({
      ...defaultValues,
      ...positionalArgs,
      stringProp: 'hello',
    });
  });

  it('parses strings to integers iif types match', () => {
    const { parseSync } = createParser(defaultValues);
    expect(parseSync(['--numProp', '1', '--stringProp', '1'])).toStrictEqual({
      ...defaultValues,
      ...positionalArgs,
      stringProp: '1',
      numProp: 1,
    });
  });

  it('rejects invalid types 1', () => {
    const { parseSync } = createParser(defaultValues);
    expect(() => {
      parseSync(['--boolProp', '1']);
    }).toThrow(
      new ValidationError(`Invalid type for --boolProp. "1" is not a boolean`)
    );
  });

  it('rejects invalid types 2', () => {
    const { parseSync } = createParser(defaultValues);
    expect(() => {
      parseSync(['--numProp', 'twelve']);
    }).toThrow(
      new ValidationError(
        `Invalid type for --numProp. "twelve" is not a number`
      )
    );
  });

  it('rejects invalid types 3', () => {
    const { parseSync } = createParser(defaultValues);
    expect(() => {
      parseSync(['--numProp']);
    }).toThrow(
      new ValidationError(`Invalid type for --numProp. "true" is not a number`)
    );
  });

  it('rejects invalid types from file', () => {
    // FS mocks have been setup in ./test/_setup.ts
    const { parseSync } = createParser(defaultValues, {
      filePathArg: { longFlag: 'file' },
    });
    expect(() => {
      parseSync(['--file', 'nested.json']);
    }).toThrow(
      'Invalid type for --stringProp. "[object Object]" is not a string'
    );
  });

  it('rejects for missing required args 1', () => {
    const { parseSync } = createParser(defaultValues, {
      options: {
        stringProp: {
          required: true,
        },
      },
    });
    expect(() => {
      parseSync([]);
    }).toThrow(new ValidationError('Missing required flag --stringProp'));
  });

  it('rejects for missing required args 2', () => {
    const { parseSync } = createParser(defaultValues, {
      options: {
        stringProp: {
          longFlag: 'my-string-prop',
          required: true,
        },
      },
    });
    expect(() => {
      parseSync([]);
    }).toThrow(new ValidationError('Missing required flag --my-string-prop'));
  });

  it('custom validation, returns', () => {
    const { parseSync } = createParser(defaultValues, {
      options: {
        stringProp: {
          required: true,
          longFlag: 'my-string-prop',
          customValidator: {
            isValid(v): v is Value {
              return typeof v === 'string' && v === 'hello';
            },
            errorMessage: () => `whaaaat`,
          },
        },
      },
    });
    expect(() => {
      parseSync(['--my-string-prop', 'hello']);
    }).not.toThrow();
  });

  it('custom validation, throws', () => {
    const { parseSync } = createParser(defaultValues, {
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
    expect(() => {
      parseSync(['--my-string-prop', 'goodbye']);
    }).toThrow(
      new ValidationError(
        'did get "goodbye" for --my-string-prop, expected hello'
      )
    );
  });
});

describe('Parsing, numeric conversions', () => {
  const parser = new Parser();
  const inputs = [
    ['1', 1],
    [true, true],
    [false, false],
    [{}, {}],
    ['.1', 0.1],
    ['1.1', 1.1],
    [undefined, undefined],
  ];
  inputs.forEach(([input, output], idx) => {
    it('test case ' + (idx + 1), () => {
      expect(parser.tryConvertToNumber(input)).toStrictEqual(output);
    });
  });
});

describe('Parsing, file reading', () => {
  mockFs.readFileSync.mockImplementation((path) => {
    if (path === 'test/long.json') {
      return JSON.stringify({
        from: 'long-flag',
      });
    }
    if (path === 'test/short.json') {
      return JSON.stringify({
        from: 'short-flag',
      });
    }

    if (path === 'nested.json') {
      return JSON.stringify({
        stringProp: {
          invalid: 'I am nested',
        },
      });
    }
    throw new Error();
  });

  it('identity when no flags are given', () => {
    const input = new Map([['--file', 'test/long.json']]);
    const content = new Parser().appendFromFile(input);
    expect(content).toStrictEqual(input);
  });
  it('identity when invalid flags are given', () => {
    const input = new Map([['--file', 'test/long.json']]);
    const content = new Parser().appendFromFile(input, 'long');
    expect(content).toStrictEqual(input);
  });
  it('from valid flag (first)', () => {
    const content = new Parser().appendFromFile(
      new Map([['--file', 'test/long.json']]),
      '--file',
      '-f'
    );
    expect(content).toMatchInlineSnapshot(`
      Map {
        "--from" => "long-flag",
      }
    `);
  });
  it('from valid flag (second)', () => {
    const content = new Parser().appendFromFile(
      new Map([['-f', 'test/short.json']]),
      '--file',
      '-f'
    );
    expect(content).toMatchInlineSnapshot(`
      Map {
        "--from" => "short-flag",
      }
    `);
  });

  it('throws for invalid files', () => {
    expect(() => {
      new Parser().appendFromFile(
        new Map([['-f', 'test/doesnotexist.json']]),
        '--file',
        '-f'
      );
    }).toThrow('test/doesnotexist.json is not a valid JSON file');
  });
});
