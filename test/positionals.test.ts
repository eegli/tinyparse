import { createParser } from '../src';
import { ArgvTransformer } from '../src/argv';
import { CountExpression } from '../src/types';

describe('Positionals, parsing count expressions', () => {
  const exprs: CountExpression[] = ['*', '=1', '>=1', '<=1'];
  exprs.forEach((expr) => {
    test(`valid symbol ${expr}`, () => {
      expect(() =>
        ArgvTransformer.parsePositionalCountExpr(expr),
      ).not.toThrow();
    });
  });
  const specialExpr: CountExpression[] = ['=0', '<=11'];
  specialExpr.forEach((expr) => {
    test(`valid symbol ${expr}`, () => {
      expect(() =>
        ArgvTransformer.parsePositionalCountExpr(expr),
      ).not.toThrow();
    });
  });

  const invalidCounts = ['=a', 'b>', '<', '>=-1'];
  invalidCounts.forEach((expr) => {
    test(`invalid symbol ${expr}`, () => {
      // @ts-expect-error Testing invalid input
      expect(() => ArgvTransformer.parsePositionalCountExpr(expr)).toThrow();
    });
  });
});

describe('Positionals validation', () => {
  const expressions: [
    CountExpression,
    {
      valid: string[][];
      invalid: string[][];
    },
  ][] = [
    [
      '*',
      {
        valid: [['a'], ['a', 'b'], ['a', 'b', 'c']],
        invalid: [],
      },
    ],
    [
      '=1',
      {
        valid: [['a']],
        invalid: [[], ['a', 'b']],
      },
    ],

    [
      '>=1',
      {
        valid: [['a'], ['a', 'b']],
        invalid: [[], []],
      },
    ],
    [
      '<=1',
      {
        valid: [['a'], []],
        invalid: [
          ['a', 'b'],
          ['a', 'b', 'c'],
        ],
      },
    ],
  ];

  for (const [expr, { valid, invalid }] of expressions) {
    const parser = createParser(
      {},
      {
        positionals: {
          count: expr,
        },
      },
    );
    test(`${expr}, valid cases`, () => {
      for (const argv of valid) {
        expect(() => parser.parseSync(argv)).not.toThrow();
      }
    });
    test(`${expr}, invalid cases`, () => {
      for (const argv of invalid) {
        expect(() => parser.parseSync(argv)).toThrow();
      }
    });
  }
});
