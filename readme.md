# Tinyparse

![npm](https://img.shields.io/npm/v/@eegli/tinyparse) ![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/eegli/tinyparse/ci-unit-tests/main) [![codecov](https://codecov.io/gh/eegli/tinyparse/branch/main/graph/badge.svg?token=8MFDR4SWYM)](https://codecov.io/gh/eegli/tinyparse)

### Opiniated, type-safe parsing module for CLI arguments and object literals.

_Like [Joi](https://joi.dev/) and [Yargs](https://yargs.js.org/) had a baby but it's not as capable as its parents._

- Promise-based
- TypeScript first
- Zero dependencies

**I use this mostly for other pet projects of mine so it comes with some opinions.**

- Tinyparse is made for parsing simple user input
- Objects to be parsed cannot be nested and need to have string keys
- Objects to be parsed can only have values that are of type string, number or boolean

**How it works**

- The package **exports a single parser factory function** from which a type-aware parser can be created. The parser accepts either an object literal or array of strings (usually, `process.argv.slice(2)`)

- The parser checks the input and returns the base with updated matching property values

- Additionally, a `help()` function is returned from the factory that can be used to print all available options, sorted by `required`

## Installation

```bash
yarn add @eegli/tinyparse
```

or

```bash
npm i @eegli/tinyparse
```

## Example

```ts
import { createParser } from '@eegli/tinyparse';

const { parse, help } = createParser(
  {
    clientId: '',
    outputDirectory: '',
  },
  [
    {
      name: 'clientId', // Name of the property
      required: true, // Fail if not present
      description: 'The client id', // Display in the helper
      shortFlag: '-cid', // Short flag alias
    },
    {
      name: 'outputDirectory',
    },
  ]
);

await parse(process.argv.slice(2)); // Process args

/* or */

await parse({
  /* Any user input */
});

// A helper command to print all available options
help('CLI Usage Example');
`
  CLI Usage Example

  Required
      -cid, --clientId <clientId> [string]
      The client id

  Optional
      --outputDirectory <outputDirectory> [string]
      
`;
```

## Usage with object literals

The object that is passed to the factory needs to specify the **exact types** that are desired for the parsed arguments. Its **exact values** will be used as a fallback/default.

```ts
import { createParser } from '@eegli/tinyparse';

const defaultConfig = {
  name: 'defaultName', // string
  age: 0, // number
  hasDog: true, // boolean
};

const { parse } = createParser(defaultConfig);

// Resolves to a full user configuration
const parsed = await parse({
  name: 'eric',
  hasDog: false,
});

expect(parsed).toStrictEqual({
  name: 'eric',
  age: 0,
  hasDog: false,
});
```

### Required options

The factory accepts an optional array of option objects for each config key. If a required argument is not present in the user input, a `ValidationError` is thrown.

This works for object literals as well as string array arguments.

```ts
const defaultConfig = {
  accessToken: '',
};

const { parse } = createParser(defaultConfig, [
  {
    name: 'accessToken',
    required: true,
  },
]);

await parse();

// --> Rejects :(
//  'accessToken is required'
```

Invalid types are also rejected.

```ts
const defaultConfig = {
  accessToken: '',
};

const { parse } = createParser(defaultConfig);

await parse({ accessToken: 12 });

// --> Rejects :(
// 'Invalid type for "accessToken". Expected string, got number'
```

## Usage with string arrays (e.g. process.argv)

### Glossary and support

Definitions from [CLI Flags Explained](https://oclif.io/blog/2019/02/20/cli-flags-explained#short-flag).

Tinyparse expects that **every** CLI argument is specified with a long or short flag. It ignores standalone arguments. A valid key-value pair consists of a flag followed by the flag argument. The order of flag + arg pairs does not matter.

| Example                       | Abstract format                     | Support |
| ----------------------------- | ----------------------------------- | ------- |
| `run-cli src/app`             | `[command] [arg]`                   | ❌      |
| `run-cli --directory src/app` | `[command] [long flag] [flag arg]`  | ✅      |
| `run-cli -d src/app`          | `[command] [short flag] [flag arg]` | ✅      |
| `run-cli --verbose`           | `[command] [boolean long flag]`     | ✅      |
| `run-cli -v `                 | `[command] [boolean short flag]`    | ✅      |

**Standalone flags** are considered booleans flags. If they are encountered, their value will be set to `true`. This means that it is not possible to specify a "falsy" flag. Tinyparse assumes that any option that can be enabled by a flag is `false` by default but can be set to true.

Optionalls, **short flags** can be specified for each argument. Short flags are expected to start with "`-`".

```ts
const { parse } = createParser(
  {
    otherPets: '',
    hasDog: true,
    hasCat: false,
  },
  [
    {
      name: 'otherPets',
      shortFlag: '-op',
    },
  ]
);

const parsedInput = await parse(['-op', 'A bird ayy', '--hasDog', '--hasCat']);

expect(parsedInput).toStrictEqual({
  otherPets: 'A bird ayy',
  hasDog: true,
  hasCat: true,
});
```

Notice how:

1. Since `hasDog` was already true, the boolean flag did not change that. Such a default configuration does not make much sense.
2. Strings that are valid numbers are automagically converted to a number (see `--age`). This only applies if the object to be parsed is an array of strings.

## TypeScript

In some rare cases, one might have a config type with optional properties. They are allowed to be undefined. In order to preserve these types for later use, the factory accepts a generic.

```ts
type Config = {
  age?: number; // Optional - should be preserved
};

const defaultConfig: Config = {};

const { parse } = createParser<Config>(defaultConfig);

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
import { createParser, ValidationError } from '@eegli/tinyparse';

const defaultConfig = {
  name: '',
};

const { parse } = createParser(defaultConfig, [
  {
    name: 'name',
    required: true,
  },
]);

try {
  await parse();
} catch (e) {
  if (e instanceof ValidationError) {
    console.error(e.message);
    // --> "name is required"
  }
}
```

## More examples

For more examples, [check the extensive test suites](test/parse.test.ts) or play in the dedicated [Code Sandbox](https://codesandbox.io/s/tinyparse-sandbox-pknk4?file=/src/index.ts)
