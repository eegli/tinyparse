import { ValidationError } from '../src/error';
import { Parser } from '../src/parser';
import { BaseFlagOptions, FlagValue } from '../src/types';
import { mockFs } from './_setup';

beforeEach(() => {
  jest.clearAllMocks();
});

const cfg = (opts: Record<string, BaseFlagOptions> = {}) =>
  new Map(Object.entries(opts));
const argv = (args: Record<string, FlagValue>) => new Map(Object.entries(args));
const alias = (args: Record<string, string>) => new Map(Object.entries(args));

describe('Parsing, with options', () => {
  test('converts strings and resolves aliases', () => {
    const result = new Parser(
      cfg({
        str: { value: '', longFlag: '--str' },
        num: { value: 1, longFlag: '--num' },
        default: { value: 'unchanged', longFlag: 'default' },
      }),
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
      new Parser(cfg({ x: { value: false, longFlag: '--x' } }))
        .withArgvInput(argv({ x: 1 }))
        .parse();
    }).toThrow(new ValidationError(`Invalid type for x. "1" is not a boolean`));
    expect(() => {
      new Parser(cfg({ xyz: { value: 0, longFlag: '--xyz' } }))
        .withArgvInput(argv({ xyz: 'twelve' }))
        .parse();
    }).toThrow(
      new ValidationError(`Invalid type for xyz. "twelve" is not a number`),
    );
    expect(() => {
      new Parser(cfg({ abc: { value: 0, longFlag: '--abc' } }))
        .withArgvInput(argv({ abc: true }))
        .parse();
    }).toThrow(
      new ValidationError(`Invalid type for abc. "true" is not a number`),
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
      new Parser(cfg({ str: { value: '', longFlag: '--str' } }))
        .withArgvInput(argv({ file: 'nested.json' }))
        .withFileInput('file')
        .parse();
    }).toThrow('Invalid type for str. "[object Object]" is not a string');
  });

  test('rejects for missing required args 1', () => {
    expect(() => {
      new Parser(
        cfg({
          '-x': { value: true, isRequired: true, longFlag: '--custom-flag' },
        }),
      ).parse();
    }).toThrow(new ValidationError('Missing required option --custom-flag'));
  });

  test('rejects for missing required args 2', () => {
    expect(() => {
      new Parser(
        cfg({
          '-x': { value: true, isRequired: true, longFlag: 'x' },
        }),
      ).parse();
    }).toThrow(new ValidationError('Missing required option x'));
  });

  test('custom validation', () => {
    expect(() => {
      new Parser(
        cfg({
          x: {
            value: '',
            longFlag: '--x',
            validator: {
              isValid(v): v is FlagValue {
                // Terrible idea in practice but works for making sure custom validation bypasses default validation
                return typeof v === 'number';
              },
              errorMessage: () => 'whaaaat',
            },
          },
        }),
      )
        .withArgvInput(argv({ x: 1 }))
        .parse();
    }).not.toThrow();
    expect(() => {
      new Parser(
        cfg({
          x: {
            value: '',
            longFlag: '--x',
            validator: {
              isValid(v): v is FlagValue {
                return typeof v === 'string' && v === 'hello';
              },
              errorMessage: (v, f) => `did get "${v}" for ${f}, expected hello`,
            },
          },
        }),
      )
        .withArgvInput(argv({ x: 'goodbye' }))
        .parse();
    }).toThrow(new ValidationError('did get "goodbye" for x, expected hello'));
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
        .collect(),
    ).toStrictEqual({});
    expect(
      new Parser(cfg({ str: { value: '', longFlag: '--str' } }))
        .withArgvInput(argv({ file: 'test.json' }))
        .withFileInput('file')
        .parse()
        .collect(),
    ).toStrictEqual({
      str: 'hello from a file',
    });
  });
  test('does not overwrite user input', () => {
    expect(
      new Parser(cfg({ str: { value: '', longFlag: '--str' } }))
        .withArgvInput(argv({ file: 'test.json' }))
        .withFileInput('file')
        .parse()
        .collect(),
    ).toStrictEqual({
      str: 'hello from a file',
    });
    expect(
      new Parser(cfg({ str: { value: '', longFlag: '--str' } }))
        .withArgvInput(argv({ file: 'test.json', str: 'hello from the cli' }))
        .withFileInput('file')
        .parse()
        .collect(),
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
