# Tinyparse

### Highly opiniated, type-safe parsing module for object literals and Node's `process.argv`.

_Like [Joi](https://joi.dev/) and [Yargs](https://yargs.js.org/) had a baby but it's not as capable as its parents._

- TypeScript first
- Promise-based
- Fast, zero dependencies
- Supports object literals and arrays of strings

**I use this mostly for other pet projects of mine, so it comes with some opinions.**

- Tinyparse has zero dependencies and is very leightweight. It's made for simple input.

- It **exports a single parser factory function** that accepts either an object literal or array of strings (usually, `process.argv.slice(2)`).

- The argument to the factory is a "base" or default configuration object. The factory returns a typed parser function. All **matching keys of the same type as the default config are updated**, the rest is taken from the base.

## Installation

```bash
yarn add @eegli/tinyparse
```

or

```bash
npm i @eegli/tinyparse
```

## Usage

The default object needs to specify the **exact types** that are desired for the parsed arguments. The exact values of `defaultInput` don't matter as long as the types are correct.

```ts
import { parserFactory } from '@eegli/tinyparse';

const defaultConfig = {
  name: '', // Want string
  age: 0, // Want number
  hasDog: true, // Want boolean
};

// Specify required object keys
const createConfig = parserFactory(defaultConfig, {
  required: ['name'],
});

// Parse matching keys and values from arbitrary input
const p1 = await parse({
  name: 'eric',
});
/* -- Resolves to
{
  name: 'eric',
  age: 0,
  hasDog: true
}
*/

// Ignores "iShouldNotExist"
const p2 = await parse({
  name: 'eeeeeric',
  age: 12,
  iShouldNotExist: true,
});
/* -- Resolves to
{
  name: 'eeeeeric',
  age: 12,
  hasDog: true
}
*/
```

### Required options

The factory may accept an optional array of required keys from the default configuration. If they are not provided in the user input, the promise is rejected.

```ts
const defaultConfig = {
  name: '', // Want string
  age: 0, // Want number
  hasDog: true, // Want boolean
};

const createConfig = parserFactory(defaultConfig, {
  required: ['name', 'age'],
});

const parsedInput = await parse({
  name: 'eric',
});

// --> Rejects :(
// 'Missing required config property "age"'
```

Invalid types are also rejected.

```ts
const defaultConfig = {
  name: '', // Want string
  age: 0, // Want number
  hasDog: true, // Want boolean
};

const parse = parserFactory(defaultConfig, {
  required: ['name', 'age'],
});

const parsedInput = await parse({
  name: 'eric',
  age: '12',
});

// --> Rejects :(
// Invalid type for option "age". Expected number, got string
```

Unknown properties are skipped.

### String/argument parsing

The parser also accepts an array of strings and parses long flags (e.g. `--name`) if they are valid.

- Long flags that are **not** followed by a non-flag are considered booleans. If they are encountered, their value will be set to `true`.

```ts
const defaultConfig = {
  name: '',
  age: 0,
  hasDog: true,
  hasCat: false,
};

const createConfig = parserFactory(defaultConfig);

const parsedInput = await parse([
  '--name',
  'eric',
  '--age',
  '12',
  '--hasCat',
  '--hasDog',
]);

/* -- parsedInput 
{
  name: 'eric',
  age: 12,
  hasDog: true,
  hasCat: true,
}
*/
```

Notice how:

1. Since `hasDog` was already true, the boolean flag did not change that.
2. Strings that are valid numbers are automagically converted to a number (`--age`)

### Short flag options

This only affects string parsing. The factory's optional config object accepts an object that maps [short flag](https://oclif.io/blog/2019/02/20/cli-flags-explained#short-flag) keys to their long siblings.

- Short flags are expected to start with "-"

```ts
const defaultConfig = {
  firstName: '', // Want string
  age: 0, // Want number
  hasDog: true, // Want boolean
};

const createConfig = parserFactory(defaultConfig, {
  shortFlags: { fn: 'firstName' },
});

const parsedInput = await parse(['-fn', 'eric', '--age', '12']);

/* -- parsedInput 
{
  firstName: 'eric',
  age: 12,
  hasDog: true
}
*/
```

## More examples

For more examples, [check the extensive test suites](test/parse.test.ts) or play in the dedicated [Code Sandbox](https://codesandbox.io/s/tinyparse-sandbox-pknk4?file=/src/index.ts)

## Limitations/Opinions

1. Objects to be parsed cannot be nested and need to have string keys
2. Objects to be parsed can only have values that are of type string, number or boolean
3. Invalid keys are ignored, invalid value types are rejected
