import { ArgvTransformer } from '../src/argv';

describe('Positionals validation, ok', () => {
  const options: [
    ...Parameters<typeof ArgvTransformer.validateCommands>,
    string,
  ][] = [
    [[], {}, 'default'],
    [['hello-world'], {}, 'no command options'],
    [
      ['x'],
      {
        cd: {
          args: '',
        },
      },
      'unknown command arg',
    ],
    [
      ['ls'],
      {
        ls: {
          args: '',
        },
      },
      'any command arguments 1',
    ],
    [
      ['ls', 'folder1', 'folder2'],
      {
        ls: {
          args: '',
        },
      },
      'any command arguments 2',
    ],
    [
      ['info'],
      {
        info: {
          args: [],
        },
      },
      'no command arguments',
    ],
    [
      ['cp', 'folder1', 'folder2'],
      {
        cp: {
          args: ['', ''],
        },
      },
      'multiple command argument',
    ],
  ];

  for (const [positionals, opts, desc] of options) {
    test(`validation, ${desc}`, () => {
      expect(() =>
        ArgvTransformer.validateCommands(positionals, opts),
      ).not.toThrow();
    });
  }
});

describe('Positionals validation, fail', () => {
  const options: [
    ...Parameters<typeof ArgvTransformer.validateCommands>,
    string,
  ][] = [
    [
      ['cd'],
      {
        cd: {
          args: ['folder'],
        },
      },
      'too few command args',
    ],
    [
      ['cd', 'folder1', 'folder2'],
      {
        cd: {
          args: [''],
        },
      },
      'too many command args',
    ],
  ];

  for (const [positionals, opts, desc] of options) {
    test(`validation, ${desc}`, () => {
      expect(() =>
        ArgvTransformer.validateCommands(positionals, opts),
      ).toThrowErrorMatchingSnapshot();
    });
  }
});
