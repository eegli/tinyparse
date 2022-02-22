# Tinyparse

![npm](https://img.shields.io/npm/v/@eegli/tinyparse) ![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/eegli/tinyparse/ci-unit-tests/main) [![codecov](https://codecov.io/gh/eegli/tinyparse/branch/main/graph/badge.svg?token=8MFDR4SWYM)](https://codecov.io/gh/eegli/tinyparse)

### Opiniated, type-safe parsing module for CLI arguments and object literals.

_Like [Joi](https://joi.dev/) and [Yargs](https://yargs.js.org/) had a baby but it's not as capable as its parents._

- Promise-based
- TypeScript first
- Zero dependencies
- Supports object literals and arrays of strings

**I use this mostly for other pet projects of mine so it comes with some opinions.**

- Tinyparse is made for parsing simple user input
- Tinyparse enforces verbose error messages
- Objects to be parsed cannot be nested and need to have string keys
- Objects to be parsed can only have values that are of type string, number or boolean

**How it works**

- The package **exports a single parser factory function** from which a type-aware parser can be created. The parser accepts either an object literal or array of strings (usually, `process.argv.slice(2)`)

- The parser checks the input and returns the base with updated matching property values

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
  name: 'defaultName', // string
  age: 0, // number
  hasDog: true, // boolean
};

const parse = parserFactory(defaultConfig);

// Resolves to a full user configuration
const p1 = await parse({
  name: 'eric',
  hasDog: false,
  age: 12,
});

expect(p1).toStrictEqual({
  name: 'eric',
  age: 12,
  hasDog: false,
});

// Unknown properties are ignored
const p2 = await parse({
  name: 'again, eric',
  unknownProperty: 'blablabla',
});

expect(p2).toStrictEqual({
  name: 'again, eric',
  age: 0,
  hasDog: true,
});
```

### Required options

In many scenarios, at least some user input is required.

The factory may accept an optional array of object literals that specify **required keys** from the default configuration. Each required property **must** specify a custom error message.

This works for object literals as well as string array arguments.

```ts
const defaultConfig = {
  accessToken: '',
};

const parse = parserFactory(defaultConfig, {
  required: [
    {
      argName: 'accessToken',
      errorMessage: 'Please specify an access token to be used',
    },
  ],
});

await parse();

// --> Rejects :(
//  'Please specify an access token to be used'
```

Invalid types are also rejected.

```ts
const defaultConfig = {
  accessToken: '',
};

const parse = parserFactory(defaultConfig);

await parse({ accessToken: 12 });

// --> Rejects :(
// 'Invalid type for "accessToken". Expected string, got number'
```

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

**Standalone flags** are considered booleans flags. If they are encountered, their value will be set to `true`. This means that it is not possible to specify a "falsy" flag. Tinyparse assumes that any option that can be enabled by a flag is `false` by default but can be set to true.

```ts
const parse = parserFactory({
  age: 0,
  hasDog: true,
  hasCat: false,
});

const parsedInput = await parse(['--hasCat', '--hasDog', '--age', '12']);

expect(parsedInput).toStrictEqual({
  age: 12,
  hasDog: true,
  hasCat: true,
});
```

Notice how:

1. Since `hasDog` was already true, the boolean flag did not change that. Such a default configuration does not make much sense.
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

expect(parsedInput).toStrictEqual({
  firstName: 'eric',
  age: 12,
});
```

## TypeScript

In some rare cases, one might have a config type with optional properties. They are allowed to be undefined. In order to preserve these types for later use, the factory accepts a generic.

```ts
type Config = {
  age?: number; // Optional - should be preserved
};

const defaultConfig: Config = {};

const parse = parserFactory<Config>(defaultConfig);

const parsedInput = await parse();
expect(parsedInput).toStrictEqual({});

/* -- type of parsedInput: 
      {
        age: string | undefined
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
  required: [{ argName: 'name', errorMessage: 'Please specify a name' }],
});

try {
  await parse();
} catch (e) {
  if (e instanceof ValidationError) {
    console.error(e.message);
    // -->'Please specify a "name"
  }
}
```

## More examples

For more examples, [check the extensive test suites](test/parse.test.ts) or play in the dedicated [Code Sandbox](https://codesandbox.io/s/tinyparse-sandbox-pknk4?file=/src/index.ts)
