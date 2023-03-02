import { ValidationError } from '../src/error';
import { Parser } from '../src/parser';
import { Value } from '../src/types';
import { mockFs } from './_setup';

beforeEach(() => {
  jest.clearAllMocks();
});

const M = (args: object) => new Map(Object.entries(args));
const NUM = 1;
const STR = 'STR';
const BOOL = true;

describe('Parsing, with options', () => {
  it('resolves if all required args are present', () => {
    const result = new Parser(M({ str: { value: STR, isRequired: true } }))
      .withArgvInput(M({ str: 'hello' }))
      .parse()
      .collect();
    expect(result).toStrictEqual({
      str: 'hello',
    });
  });

  it('parses strings to integers iif types match', () => {
    const result = new Parser(M({ str: { value: STR }, num: { value: NUM } }))
      .withArgvInput(M({ num: 1, str: '1' }))
      .parse()
      .collect();
    expect(result).toStrictEqual({
      str: '1',
      num: 1,
    });
  });

  it('resolves aliases', () => {
    const result = new Parser(M({ num: { value: NUM } }))
      .withArgvInput(M({ '--num': 1 }), M({ '--num': 'num' }))
      .parse()
      .collect();
    expect(result).toStrictEqual({
      num: 1,
    });
  });

  it('rejects invalid types 1', () => {
    expect(() => {
      new Parser(M({ x: { value: BOOL } })).withArgvInput(M({ x: 1 })).parse();
    }).toThrow(new ValidationError(`Invalid type for x. "1" is not a boolean`));
  });

  it('rejects invalid types 2', () => {
    expect(() => {
      new Parser(M({ xyz: { value: NUM } }))
        .withArgvInput(M({ xyz: 'twelve' }))
        .parse();
    }).toThrow(
      new ValidationError(`Invalid type for xyz. "twelve" is not a number`)
    );
  });

  it('rejects invalid types 3', () => {
    expect(() => {
      new Parser(M({ abc: { value: NUM } }))
        .withArgvInput(M({ abc: true }))
        .parse();
    }).toThrow(
      new ValidationError(`Invalid type for abc. "true" is not a number`)
    );
  });

  it('rejects invalid types from file', () => {
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
      new Parser(M({ str: { value: STR } }))
        .withArgvInput(M({ file: 'nested.json' }))
        .withFileInput('file')
        .parse();
    }).toThrow('Invalid type for str. "[object Object]" is not a string');
  });

  it('rejects for missing required args', () => {
    expect(() => {
      new Parser(M({ '-x': { value: BOOL, isRequired: true } })).parse();
    }).toThrow(new ValidationError('Missing required argument -x'));
  });

  it('custom validation, returns', () => {
    expect(() => {
      new Parser(
        M({
          x: {
            type: STR,
            validator: {
              isValid(v: unknown): v is Value {
                return typeof v === typeof NUM && v === 1;
              },
              errorMessage: () => 'whaaaat',
            },
          },
        })
      )
        .withArgvInput(M({ x: 1 }))
        .parse();
    }).not.toThrow();
  });

  it('custom validation, throws', () => {
    expect(() => {
      new Parser(
        M({
          x: {
            type: STR,
            validator: {
              isValid(v: unknown): v is Value {
                return typeof v === typeof STR && v === 'hello';
              },
              errorMessage: (v: unknown, f: string) =>
                `did get "${v}" for ${f}, expected hello`,
            },
          },
        })
      )
        .withArgvInput(M({ x: 'goodbye' }))
        .parse();
    }).toThrow(new ValidationError('did get "goodbye" for x, expected hello'));
  });
});

describe('Parsing, numeric conversions', () => {
  const parser = new Parser(M({}));
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
    if (path === 'test.json') {
      return JSON.stringify({
        str: 'hello from a file',
      });
    }
    throw new Error();
  });

  it('identity for missing and invalid flags are given', () => {
    expect(
      new Parser()
        .withArgvInput(M({ file: '' }))
        .withFileInput()
        .parse()
        .collect()
    ).toStrictEqual({});
    expect(
      new Parser()
        .withArgvInput(M({ file: '' }))
        .withFileInput('no-file')
        .parse()
        .collect()
    ).toStrictEqual({});
  });
  it('reads file path from flag and collects', () => {
    expect(
      new Parser(M({ str: { value: STR } }))
        .withArgvInput(M({ file: 'test.json' }))
        .withFileInput('file')
        .parse()
        .collect()
    ).toStrictEqual({
      str: 'hello from a file',
    });
  });
  it('does not overwrite user input', () => {
    expect(
      new Parser(M({ str: { value: STR } }))
        .withArgvInput(M({ file: 'test.json' }))
        .withFileInput('file')
        .parse()
        .collect()
    ).toStrictEqual({
      str: 'hello from a file',
    });
    expect(
      new Parser(M({ str: { value: STR } }))
        .withArgvInput(M({ file: 'test.json', str: 'hello from the cli' }))
        .withFileInput('file')
        .parse()
        .collect()
    ).toStrictEqual({
      str: 'hello from the cli',
    });
  });
  it('throws for invalid files', () => {
    expect(() => {
      new Parser()
        .withArgvInput(M({ file: 'doesnotexist.json' }))
        .withFileInput('file');
    }).toThrow('doesnotexist.json is not a valid JSON file');
  });
});
