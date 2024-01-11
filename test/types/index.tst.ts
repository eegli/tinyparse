import { expectAssignable, expectNotAssignable, expectType } from 'tsd-lite';
import type { FlagValue } from '../../src';
import { createParser } from '../../src';
import { WithPositionalArgs } from '../../src/types';

/**
 * Return type tests
 */

type Input = {
  name: string;
  age: number;
  loggedIn: boolean;
};

expectAssignable<Promise<WithPositionalArgs<Input>>>(
  createParser({
    name: 'eric',
    age: 11,
    loggedIn: false,
  }).parse(),
);
expectAssignable<Promise<WithPositionalArgs<Input>>>(
  createParser({
    name: 'eric',
    age: 11,
    loggedIn: false,
  }).parse([]),
);
expectAssignable<WithPositionalArgs<Input>>(
  createParser({
    name: 'eric',
    age: 11,
    loggedIn: false,
  }).parseSync(),
);

/**
 * Parameter and option tests
 */
type Defaults = Parameters<typeof createParser<Input>>[0];

expectType<Defaults>({ name: '', age: 0, loggedIn: true });
expectNotAssignable<Defaults>({
  name: {},
});
expectNotAssignable<Defaults>({
  name: [],
});
expectNotAssignable<Defaults>({
  [Symbol.iterator]: null,
});

type Params = Parameters<typeof createParser<Input>>[1];

expectAssignable<Params>({});
expectAssignable<Params>({
  filePathArg: {
    longFlag: '--file',
  },
});
expectAssignable<Params>({
  options: {},
});
expectAssignable<Params>({
  options: {
    name: {
      required: true,
      description: 'The name of the user',
      shortFlag: `-n`,
      longFlag: `--name`,
      customValidator: {
        isValid(v: unknown): v is FlagValue {
          return typeof v === 'string' && v.length > 0;
        },
        errorMessage: () => 'Error',
      },
    },
    age: {},
    loggedIn: {},
  },
});
expectNotAssignable<Params>({
  options: {
    age2: {},
  },
});

/**
 * Infer commands tests
 */
/* {
  const positionals = createParser(
    {},
    {
      subcommands: {
        cmd: {
          args: ['arg1', 'arg2'],
        },
      } as const,
    },
  ).parseSync()._;
  const [cmd, ..._args] = positionals;
  switch (cmd) {
    case 'cmd': {
      const [, ...args] = positionals;
      expect(cmd).type.toEqual<'cmd' | AnyString>();
      expect(args).type.toEqual<[string, string]>();
      break;
    }
    default: {
      expect(cmd).type.toEqual<AnyString>();
      const [, ..._args] = positionals;
    }
  }
}
 */
// expectType<['cmd', string, string]>(commands);

/* expectType<['cmd']>(
  createParser(
    {},
    {
      subcommands: {
        cmd: {
          args: [],
        },
      } as const,
    },
  ).parseSync()._,
);

const subcommand3 = createParser(
  {},
  {
    subcommands: {
      cmd: {
        args: 'args',
      },
    } as const,
  },
).parseSync()._;
expectType<['cmd', ...string[]]>(subcommand3);

expectType<['cmd', ...string[]]>(
  createParser(
    {},
    {
      subcommands: {
        cmd: {
          args: '',
        },
      },
    },
  ).parseSync()._,
);

expectType<['cmd', ...string[]]>(
  createParser(
    {},
    {
      subcommands: {
        cmd: {
          args: [],
        },
      },
    },
  ).parseSync()._,
);

expectType<['cmd', ...string[]]>(
  createParser(
    {},
    {
      subcommands: {
        cmd: {
          args: [''],
        },
      },
    },
  ).parseSync()._,
); */
