import { expect } from 'tstyche';
import type { Value } from '../../src';
import { createParser } from '../../src';
import { WithPositionalArgs } from '../../src/types';

type Input = {
  name: string;
  age: number;
  loggedIn: boolean;
};

expect<Promise<WithPositionalArgs<Input>>>().type.toBeAssignable(
  createParser({
    name: 'eric',
    age: 11,
    loggedIn: false,
  }).parse(),
);

expect<WithPositionalArgs<Input>>().type.toBeAssignable(
  createParser({
    name: 'eric',
    age: 11,
    loggedIn: false,
  }).parseSync(),
);

expect<Promise<WithPositionalArgs<Input>>>().type.toBeAssignable(
  createParser({
    name: 'eric',
    age: 11,
    loggedIn: false,
  }).parse([]),
);

type Params = Parameters<typeof createParser<Input>>[1];

expect<Params>().type.toBeAssignable({});
expect<Params>().type.toBeAssignable({
  filePathArg: {
    longFlag: '--file',
  },
});
expect<Params>().type.toBeAssignable({
  options: {},
});
expect<Params>().type.toBeAssignable({
  options: {
    name: {
      required: true,
      description: 'The name of the user',
      shortFlag: `-n`,
      longFlag: `--name`,
      customValidator: {
        isValid(v: unknown): v is Value {
          return typeof v === 'string' && v.length > 0;
        },
        errorMessage: () => 'Error',
      },
    },
    age: {},
    loggedIn: {},
  },
});
expect<Params>().type.not.toBeAssignable({
  options: {
    age2: {},
  },
});

type Defaults = Parameters<typeof createParser<Input>>[0];

expect<Defaults>().type.toEqual({ name: '', age: 0, loggedIn: true });

expect<Defaults>().type.not.toBeAssignable({
  name: {},
});
expect<Defaults>().type.not.toBeAssignable({
  name: [],
});
expect<Defaults>().type.not.toBeAssignable({
  [Symbol.iterator]: null,
});
