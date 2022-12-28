import { expectAssignable, expectNotAssignable, expectType } from 'tsd-lite';
import { createParser } from '../../src';

type Input = {
  name: string;
  age: number;
  loggedIn: boolean;
};

expectType<Promise<Input>>(
  createParser<Input>({
    name: 'eric',
    age: 11,
    loggedIn: false,
  }).parse()
);

expectAssignable<Promise<Input>>(
  createParser({
    name: 'eric',
    age: 11,
    loggedIn: false,
  }).parse()
);

type Options = Parameters<typeof createParser<Input>>[1];
type KeyOptions = NonNullable<Options>['options'];

expectAssignable<Options>({});
expectAssignable<Options>({
  filePathArg: {
    longFlag: '--file' as const,
  },
});
expectAssignable<Options>({
  options: {},
});
expectAssignable<KeyOptions>({
  name: {
    required: true,
    description: 'The name of the user',
    shortFlag: `-n` as const,
    customValidator: {
      isValid: () => true,
      errorMessage: () => 'Error',
    },
  },
  age: {},
  loggedIn: {},
});

type Defaults = Parameters<typeof createParser<Input>>[0];

expectNotAssignable<Defaults>({
  name: {},
});
expectNotAssignable<Defaults>({
  name: [],
});
expectNotAssignable<Defaults>({
  [Symbol.iterator]: null,
});
