# Tinyparse

![npm](https://img.shields.io/npm/v/@eegli/tinyparse) ![GitHub Workflow Status (branch)](https://img.shields.io/github/actions/workflow/status/eegli/tinyparse/ci.yml?branch=main) [![codecov](https://codecov.io/gh/eegli/tinyparse/branch/main/graph/badge.svg?token=8MFDR4SWYM)](https://codecov.io/gh/eegli/tinyparse) ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@eegli/tinyparse)

### Opiniated, type-safe parsing module for CLI arguments and object literals.

_Like [Joi](https://joi.dev/) and [Yargs](https://yargs.js.org/) had a baby but it's not as capable as its parents._

- Promise-based
- TypeScript first
- JSON file parsing support
- Zero dependencies

**I use this mostly for other pet projects of mine so it comes with some opinions.**

Tinyparse is made for parsing simple user input. It can parse object literals and arrays of strings - usually, `process.argv`. The object to parse _into_ may only have `string`, `number` or `boolean` property values.

```ts
import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';

const defaultValues = {
  username: '',
};

const { parse } = createParser(defaultValues);

const parsed1 = await parse({ username: 'eegli' });
const parsed2 = await parse(['--username', 'eegli']);

assert.deepStrictEqual(parsed1, { username: 'eegli' });
assert.deepStrictEqual(parsed2, { username: 'eegli', _: [] });
```

## Installation

Node.js v14 or later is required.

```bash
yarn add @eegli/tinyparse
```

or

```bash
npm i @eegli/tinyparse
```

## Usage example

Tinyparse binds a parser to some default values you feed it.

`createParser(defaultValues, options = {})`

- First argument: An object literal that specifies the **exact types** that are desired for the parsed arguments. Its **exact values** will be used as a fallback/default.

- Second argument: Options object. You can specify both a _file flag_ (whose value will point to a file) and options per key.

Note that most arguments and options are optional. IntelliSense and
TypeScript will show you the detailed signatures and what is required.

The factory creates a `help()` function that can be used to print all available options, sorted by `required`. This is most useful for CLI apps.

```ts
import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';

// Default values. They will be used as defaults/fallback
const defaultUser = {
  username: '',
  age: 0,
  hasGithubProfile: false,
};

const { help, parse } = createParser(
  defaultUser,
  // More configuration
  {
    // Parse a file (for example, a config file). Only takes
    // effect when parsing an array of strings
    filePathArg: {
      longFlag: '--config',
      description: 'Path to your Github config file',
    },
    // Options per key
    options: {
      username: {
        // Fail if there is no value for "username"
        required: true,
        description: 'Your custom username',
      },
      age: {
        // A custom validator that will receive the value for
        // "age". It must return a boolean
        customValidator: {
          isValid: (value) => typeof value === 'number' && value > 0,
          // The error message for when validation fails
          errorMessage: (v) => `${v} is not a positive number`,
        },
      },
      hasGithubProfile: {
        description: 'Indicate whether you have a Github profile',
        // Short flag alias. Only takes effect when parsing an
        // array of strings
        shortFlag: '-ghp',
      },
    },
  }
);

// Some user input
const userInput = {
  username: 'eegli',
  age: 12,
};

const parsedInput = await parse(userInput);

assert.deepStrictEqual(parsedInput, {
  username: 'eegli',
  age: 12,
  hasGithubProfile: false,
});

// Read from file "github.json" with content {"username": "eegli"}
process.argv = ['profile', '--age', '12', '-ghp', '--config', 'github.json'];

const parsedArgv = await parse(process.argv);

// When parsing an array of strings, positional arguments are available on the _ property
assert.deepStrictEqual(parsedArgv, {
  _: ['profile'],
  username: 'eegli',
  age: 12,
  hasGithubProfile: true,
});

help();
`Usage

Required
   --username [string]
   Your custom username

Optional
   --age [number]

   -ghp, --hasGithubProfile [boolean]
   Indicate whether you have a Github profile

   --config [string]
   Path to your Github config file
`;
```

### Parsing required properties

A key can be marked as required. If a required key is not present in the input, a `ValidationError` is thrown.

This works for object literals as well as string array arguments.

```ts
import { createParser, ValidationError } from '@eegli/tinyparse';

const { parse } = createParser(
  { username: '' },
  {
    options: {
      username: {
        required: true,
      },
    },
  }
);

try {
  await parse(); // This will throw!
} catch (e) {
  if (e instanceof ValidationError) {
    console.log(e.message); // '"username" is required'
  }
}
```

Invalid types are also rejected.

```ts
const { parse } = createParser({ username: '' });

try {
  await parse({ username: ['eegli'] }); // This will throw!
} catch (e) {
  if (e instanceof ValidationError) {
    console.log(e.message); // 'Invalid type for "username". Expected string, got object'
  }
}
```

**Unknown arguments are ignored.**

## Usage with string arrays (e.g. process.argv)

### Glossary and support

Definitions from [CLI Flags Explained](https://oclif.io/blog/2019/02/20/cli-flags-explained#short-flag).

Tinyparse allows both **positional arguments** and **long or short flags** that start with a hyphen (`-`). A valid flag-value pair consists of a flag followed by the flag value, separated by a whitespace. The order of flag + arg pairs does not matter.

All arguments until the first flag are considered positional arguments. Later "positional" arguments that follow a flag value are ignored (see example below).

| Example                       | Abstract format                     | Support |
| ----------------------------- | ----------------------------------- | ------- |
| `run-cli src/app`             | `[command] [arg]`                   | ✅      |
| `run-cli --directory src/app` | `[command] [long flag] [flag arg]`  | ✅      |
| `run-cli -d src/app`          | `[command] [short flag] [flag arg]` | ✅      |
| `run-cli --verbose`           | `[command] [boolean long flag]`     | ✅      |
| `run-cli -v `                 | `[command] [boolean short flag]`    | ✅      |

**Standalone flags** are considered booleans flags. If they are encountered, their value will be set to `true`. This means that it is not possible to specify a "falsy" flag. Tinyparse assumes that any option that can be enabled by a flag is `false` by default but can be set to `true`.

Optionally, **short flags** can be specified for each argument. Short flags are expected to start with "`-`".

```ts
import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';

const { parse } = createParser(
  {
    name: '',
    hasGithubProfile: false,
    hasGithubPlus: true,
    followerCount: 0,
    birthYear: '',
  },
  {
    options: {
      followerCount: {
        shortFlag: '-fc',
      },
    },
  }
);
const parsed = await parse([
  'congratulate', // Positional argument
  '--name',
  '"Eric Egli"', // Value with spaces
  '--hasGithubProfile', // Boolean flag
  '--hasGithubPlus',
  '-fc', // Short flag
  '10', // Will be parsed as number
  'ignoredProperty', // This property is ignored
  '--birthYear',
  '2018', // Will remain a string
]);

assert.deepStrictEqual(parsed, {
  _: ['congratulate'],
  name: '"Eric Egli"',
  hasGithubPlus: true,
  hasGithubProfile: true,
  followerCount: 10,
  birthYear: '2018',
});
```

Notice how:

- Since `hasGithubPlus` was already true, the boolean flag did not change that. Such a default configuration does not make much sense.
- If the _expected value_ for a flag is a number, tinyparse will try to parse it accordingly (see `--followerCount` / `-fc`). This only applies if the object to be parsed is an array of strings.
- Altough we could parse the value for `--birthYear` to a number (`2018`), it is kept as a string since that is what's expected with the given default value (`{ birthYear: '' }`)

### Good to know when parsing strings

- `-` is a reserved prefix. Any string that starts with `-` will be treated as a flag and not a flag argument. Arguments such as `["--password", "-x8ap!"]` should be wrapped in quotes!
- Later values will overwrite earlier values. `["--password", "abc", "--password", "xyz"]` will parse to `password: "xyz"`
- Remember that it's never a good idea to read secrets directly from flags. [Read them from a file instead](https://clig.dev/#arguments-and-flags)

## More examples

For more examples, [check the extensive test suites](test) or play in the dedicated [Code Sandbox](https://codesandbox.io/s/tinyparse-sandbox-pknk4?file=/src/index.ts).

## Resources

This project has been guided by the amazing [Command Line Interface Guidelines](https://clig.dev/) by Aanand Prasad, Ben Firshman, Carl Tashian and Eva Parish.
