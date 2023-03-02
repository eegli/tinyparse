import { ValidationError } from '../src/error';
import { Parser } from '../src/parser';
import { BaseFlagOption, Value } from '../src/types';
import { mockFs } from './_setup';

beforeEach(() => {
  jest.clearAllMocks();
});

const cfg = (opts: Record<string, BaseFlagOption> = {}) =>
  new Map(Object.entries(opts));
const argv = (args: Record<string, Value>) => new Map(Object.entries(args));
const alias = (args: Record<string, string>) => new Map(Object.entries(args));

const numVal = 1;
const strVal = 'str';
const boolVal = true;

describe('Parsing, with options', () => {
  test('converts strings and resolves aliases', () => {
    const result = new Parser(
      cfg({
        str: { value: strVal },
        num: { value: numVal },
        default: { value: 'unchanged' },
      })
    )
      .withArgvInput(argv({ '--num': 1, str: '1' }), alias({ '--num': 'num' }))
      .parse()
      .collect();
    expect(result).toStrictEqual({
      str: '1',
      num: 1,
      default: 'unchanged',
    });
  });

  test('rejects invalid types', () => {
    expect(() => {
      new Parser(cfg({ x: { value: boolVal } }))
        .withArgvInput(argv({ x: 1 }))
        .parse();
    }).toThrow(new ValidationError(`Invalid type for x. "1" is not a boolean`));
    expect(() => {
      new Parser(cfg({ xyz: { value: numVal } }))
        .withArgvInput(argv({ xyz: 'twelve' }))
        .parse();
    }).toThrow(
      new ValidationError(`Invalid type for xyz. "twelve" is not a number`)
    );
    expect(() => {
      new Parser(cfg({ abc: { value: numVal } }))
        .withArgvInput(argv({ abc: true }))
        .parse();
    }).toThrow(
      new ValidationError(`Invalid type for abc. "true" is not a number`)
    );
  });

  test('rejects invalid types from file', () => {
    mockFs.readFileSync.mockImplementationOnce((path) => {
      if (path === 'nested.json') {
        return JSON.stringify({
          str: {
            nested: true,
          },
        });
      }
      throw new Error();
    });

    expect(() => {
      new Parser(cfg({ str: { value: strVal } }))
        .withArgvInput(argv({ file: 'nested.json' }))
        .withFileInput('file')
        .parse();
    }).toThrow('Invalid type for str. "[object Object]" is not a string');
  });

  test('rejects for missing required args', () => {
    expect(() => {
      new Parser(cfg({ '-x': { value: boolVal, isRequired: true } })).parse();
    }).toThrow(new ValidationError('Missing required argument -x'));
  });

  test('custom validation', () => {
    expect(() => {
      new Parser(
        cfg({
          x: {
            value: strVal,
            validator: {
              isValid(v): v is Value {
                // Terrible idea in practice but works for making sure custom validation bypasses default validation
                return typeof v === 'number';
              },
              errorMessage: () => 'whaaaat',
            },
          },
        })
      )
        .withArgvInput(argv({ x: 1 }))
        .parse();
    }).not.toThrow();
    expect(() => {
      new Parser(
        cfg({
          x: {
            value: strVal,
            validator: {
              isValid(v): v is Value {
                return typeof v === typeof strVal && v === 'hello';
              },
              errorMessage: (v, f) => `did get "${v}" for ${f}, expected hello`,
            },
          },
        })
      )
        .withArgvInput(argv({ x: 'goodbye' }))
        .parse();
    }).toThrow(new ValidationError('did get "goodbye" for x, expected hello'));
  });
});

describe('Parsing, numeric conversions', () => {
  const parser = new Parser(cfg({}));
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
    test('test case ' + (idx + 1), () => {
      expect(parser.tryConvertToNumber(input)).toStrictEqual(output);
    });
  });
});

describe('Parsing, file reading', () => {
  mockFs.readFileSync.mockImplementation((path) => {
    if (path === 'test.json') {
      return JSON.stringify({
        str: 'hello from a file',
      });
    }
    throw new Error();
  });

  test('reads file path from flag and collects', () => {
    expect(
      new Parser(cfg())
        .withArgvInput(argv({ file: '' }))
        .withFileInput('no-file')
        .parse()
        .collect()
    ).toStrictEqual({});
    expect(
      new Parser(cfg({ str: { value: strVal } }))
        .withArgvInput(argv({ file: 'test.json' }))
        .withFileInput('file')
        .parse()
        .collect()
    ).toStrictEqual({
      str: 'hello from a file',
    });
  });
  test('does not overwrite user input', () => {
    expect(
      new Parser(cfg({ str: { value: strVal } }))
        .withArgvInput(argv({ file: 'test.json' }))
        .withFileInput('file')
        .parse()
        .collect()
    ).toStrictEqual({
      str: 'hello from a file',
    });
    expect(
      new Parser(cfg({ str: { value: strVal } }))
        .withArgvInput(argv({ file: 'test.json', str: 'hello from the cli' }))
        .withFileInput('file')
        .parse()
        .collect()
    ).toStrictEqual({
      str: 'hello from the cli',
    });
  });
  test('throws for invalid files', () => {
    expect(() => {
      new Parser(cfg())
        .withArgvInput(argv({ file: 'doesnotexist.json' }))
        .withFileInput('file');
    }).toThrow('doesnotexist.json is not a valid JSON file');
  });
});
