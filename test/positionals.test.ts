import { ArgvTransformer } from '../src/argv';

describe('Positionals validation, ok', () => {
  const options: [
    ...Parameters<typeof ArgvTransformer.validatePositionals>,
    string,
  ][] = [
    [[], {}, 'default'],
    [
      ['a'],
      {
        expect: [['a']],
      },
      'single positional',
    ],
    [
      ['b'],
      {
        expect: [['a', 'b']],
      },
      'two positionals',
    ],
    [
      ['a', 'b'],
      {
        expect: [['a'], null],
      },
      'two positionals, one optional',
    ],
    [
      ['A'],
      {
        expect: [['a']],
      },
      'case insensitive',
    ],
  ];

  for (const [positionals, opts, desc] of options) {
    test(`validation, ${desc}`, () => {
      expect(() =>
        ArgvTransformer.validatePositionals(positionals, opts),
      ).not.toThrow();
    });
  }
});

describe('Positionals validation, fail', () => {
  const options: [
    ...Parameters<typeof ArgvTransformer.validatePositionals>,
    string,
  ][] = [
    [
      [],
      {
        expect: [['a']],
      },
      'too few positionals',
    ],
    [
      ['hello'],
      {
        rejectAdditional: true,
      },
      'too many positionals',
    ],
    [
      ['a'],
      {
        expect: [['b']],
      },
      'unexpected positional',
    ],
    [
      ['a'],
      {
        expect: [['A']],
        caseSensitive: true,
      },
      'case sensitive',
    ],
  ];

  for (const [positionals, opts, desc] of options) {
    test(`validation, ${desc}`, () => {
      expect(() =>
        ArgvTransformer.validatePositionals(positionals, opts),
      ).toThrow();
    });
  }
});
