import { expectAssignable, expectType } from 'tsd-lite';
import { createParser } from '../../src';

type Input = {
  name: string;
  age: number;
  loggedIn: boolean;
};

expectAssignable<Promise<Input>>(
  createParser({
    name: 'eric',
    age: 11,
    loggedIn: false,
  }).parse()
);

expectType<Promise<Input>>(
  createParser<Input>({
    name: 'eric',
    age: 11,
    loggedIn: false,
  }).parse()
);
