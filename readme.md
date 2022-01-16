# Tinyparse

![npm](https://img.shields.io/npm/v/@eegli/tinyparse) ![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/eegli/tinyparse/ci-unit-tests/main) [![codecov](https://codecov.io/gh/eegli/tinyparse/branch/main/graph/badge.svg?token=8MFDR4SWYM)](https://codecov.io/gh/eegli/tinyparse)

### Opiniated, type-safe parsing module for CLI arguments and object literals.

_Like [Joi](https://joi.dev/) and [Yargs](https://yargs.js.org/) had a baby but it's not as capable as its parents._

- TypeScript first
- Promise-based
- Zero dependencies
- Supports object literals and arrays of strings

**I use this mostly for other pet projects of mine, so it comes with some opinions.**

- Tinyparse is fast and lightweight. It's made for parsing simple user inputs.

- It **exports a single parser factory function** from which a type-aware parser can be created. The parser accepts either an object literal or array of strings (usually, `process.argv.slice(2)`).

- The parser checks the input and returns the base with updated matching property values.

## Installation

```bash
yarn add @eegli/tinyparse
```

or

```bash
npm i @eegli/tinyparse
```

## Usage with object literals

The object that is passed to the factory needs to specify the **exact types** that are desired for the parsed arguments. Its **exact values** will be used as a fallback/default.

```ts
import { parserFactory } from '@eegli/tinyparse';

const defaultConfig = {
  name: '', // want string
  age: 0, // want number
  hasDog: true, // want boolean
};

const parse = parserFactory(defaultConfig, {
  required: ['name'], // a valid key of defaultConfig
});

const p1 = await parse({
  name: 'eric',
  hasDog: false,
});

/* -- Resolves to
{
  name: 'eric', --> user input
  age: 0, --> default value
  hasDog: false --> user input
}
*/

const p2 = await parse({
  name: 'eeeeeric',
  age: 12,
  iShouldNotExist: true, // is ignored
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

In many scenarios, at least some user input is required.

The factory may accept an optional array of required keys from the default configuration. If they are not provided in the user input, the promise is rejected.

This works for object literals as well as string array arguments.

```ts
const defaultConfig = {
  name: '',
  age: 0,
};

const parse = parserFactory(defaultConfig, {
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
  name: '',
  age: 0,
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

## Usage with string arrays (e.g. process.argv)

### Glossary and support

Definitions from [CLI Flags Explained](https://oclif.io/blog/2019/02/20/cli-flags-explained#short-flag).

Tinyparse expects that **every** CLI argument is specified with a flag. It ignores standalone arguments. A valid key-value pair consists of a flag followed by the flag argument. The order of flag + arg pairs does not matter.

```bash
run-cli src/app 👉 [command] [arg] | ❌
```

```bash
run-cli --directory src/app 👉 [command] [long flag] [flag arg] | ✅
```

```bash
run-cli -d src/app 👉 [command] [short flag] [flag arg] | ✅
```

```bash
run-cli --verbose 👉 [command] [boolean long flag] | ✅
```

```bash
run-cli -v 👉 [command] [boolean short flag] | ✅
```

**Flags that are followed by a flag** are considered booleans flags. If they are encountered, their value will be set to `true`.

```ts
const defaultConfig = {
  age: 0
  hasDog: true,
  hasCat: false,
};

const parse = parserFactory(defaultConfig);

const parsedInput = await parse([
  "--age",
  "12",
  '--hasCat',
  '--hasDog',
]);

/* -- parsedInput
{
  age: 12,
  hasDog: true,
  hasCat: true,
}
*/
```

Notice how:

1. Since `hasDog` was already true, the boolean flag did not change that.
2. Strings that are valid numbers are automagically converted to a number (see `--age`). This only applies if the object to be parsed is an array of strings.

### Short flag options

Only applies to string parsing. The factory's optional config parameter accepts an object that maps [short flag](https://oclif.io/blog/2019/02/20/cli-flags-explained#short-flag) keys to their long siblings.

- Short flags are expected to start with "`-`"

```ts
const defaultConfig = {
  firstName: '',
  age: 0,
};

const parse = parserFactory(defaultConfig, {
  shortFlags: { '-fn': 'firstName' },
});

const parsedInput = await parse(['-fn', 'eric', '--age', '12']);

/* -- parsedInput 
{
  firstName: 'eric',
  age: 12,
}
*/
```

## TypeScript

In some rare cases, one might have a config type with optional properties. They are allowed to be undefined. In order to preserve these types for later use, the factory accepts a generic.

```ts
type Config = {
  name: string;
  hasDog?: boolean; // Optional - should be preserved
};

const defaultConfig: Config = {
  name: '',
  hasDog: true,
};

// Preserve optional types
const parse = parserFactory<Config>(defaultConfig, {
  required: ['name'],
});

const parsedInput = await parse({
  name: 'eric',
});

/* -- value of parsedInput 
{
  firstName: 'eric',
  hasDog: true
}
*/

/* -- type of parsedInput 
{
  firstName: string,
  hasDog: boolean | undefined
}
*/
```

## Error handling

Tinyparse exports a `ValidationError` class. You can use it to check if, in a large try-catch block, the error originated from parsing something.

```ts
import { parserFactory, ValidationError } from '@eegli/tinyparse';

const defaultConfig = {
  name: '',
};

const parse = parserFactory(defaultConfig, {
  required: ['name'],
});

try {
  const parsed = await parse({
    notNameProperty: 'eric',
  });
} catch (e) {
  if (e instanceof ValidationError) {
    // Do whatever.

    console.error(e.message);
    // -->'Missing required property "name"
  }
}
```

## More examples

For more examples, [check the extensive test suites](test/parse.test.ts) or play in the dedicated [Code Sandbox](https://codesandbox.io/s/tinyparse-sandbox-pknk4?file=/src/index.ts)

## Limitations/Opinions

1. Objects to be parsed cannot be nested and need to have string keys
2. Objects to be parsed can only have values that are of type string, number or boolean
3. Invalid keys are ignored, invalid value types are rejected
