# Tinyparse

![npm](https://img.shields.io/npm/v/@eegli/tinyparse) ![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/eegli/tinyparse/ci-unit-tests/main) [![codecov](https://codecov.io/gh/eegli/tinyparse/branch/main/graph/badge.svg?token=8MFDR4SWYM)](https://codecov.io/gh/eegli/tinyparse) ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@eegli/tinyparse)

### Opiniated, type-safe parsing module for CLI arguments and object literals.

_Like [Joi](https://joi.dev/) and [Yargs](https://yargs.js.org/) had a baby but it's not as capable as its parents._

- Promise-based
- TypeScript first
- JSON file parsing support
- Zero dependencies

**I use this mostly for other pet projects of mine so it comes with some opinions**

Tinyparse is made for parsing simple user input. It can parse arbitrary object literals and arrays of strings, usually, `process.argv.slice(2)`.

- The object to parse into must be of type `Record<string, string | number | boolean>`
- When parsing JSON files, they must deserialized into the same simple `Record` shape

## Installation

```bash
yarn add @eegli/tinyparse
```

or

```bash
npm i @eegli/tinyparse
```

## Usage example

- First argument: An object literal that specifies the **exact types** that are desired for the parsed arguments. Its **exact values** will be used as a fallback/default

- Second argument: Options object. You can specify both a "file flag" (whose value will point to a file) and options per key

Note that most arguments and options are optional. IntelliSense and
TypeScript will show you the detailed signatures and what is required.

The factory creates a `help()` function that can be used to print all available options, sorted by `required`. This is most useful for CLI apps.

```ts
import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';

// Default values. These will be used as defaults/fallback
const defaultValues = {
  username: '',
  hasGithubProfile: false,
};

const { help, parse } = createParser(
  defaultValues,
  // Optional configuration
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
        // Fail if not present
        required: true,
        // For the help() command
        description: 'Your Github username',
      },
      hasGithubProfile: {
        description: 'Indicate whether you have a Github profile',
        // Short flag alias. Only takes effect when parsing an
        // array of strings
        shortFlag: '-gp',
      },
    },
  }
);
const parsedObj = await parse({ username: 'feegli' });
assert.deepStrictEqual(parsedObj, {
  username: 'feegli',
  hasGithubProfile: false,
});

// process.argv = ['arg0','arg1', '-gp', '--config', 'github.json']
// Read from file "github.json" with content {"username": "eegli"}
const parsedArgv = await parse(process.argv);
assert.deepStrictEqual(parsedArgv, {
  username: 'eegli',
  hasGithubProfile: true,
});

help();
`"Usage

    Required
        --username <username> [string]
        Your Github username

    Optional
        -gp, --hasGithubProfile [boolean]
        Indicate whether you have a Github profile

        --config [string]
        Path to your Github config file
"`;
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

Tinyparse expects that **every** CLI argument is specified with a long or short flag. It ignores standalone arguments. A valid key-value pair consists of a flag followed by the flag argument. The order of flag + arg pairs does not matter.

| Example                       | Abstract format                     | Support |
| ----------------------------- | ----------------------------------- | ------- |
| `run-cli src/app`             | `[command] [arg]`                   | ❌      |
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
    hasGithubProfile: false,
    hasGithubPlus: true,
    followerCount: 0,
  },
  { options: { followerCount: { shortFlag: '-fc' } } }
);

const parsed = await parse([
  '--hasGithubProfile',
  '--hasGithubPlus',
  '-fc',
  '10',
]);

assert.deepStrictEqual(parsed, {
  hasGithubPlus: true,
  hasGithubProfile: true,
  followerCount: 10,
});
```

Notice how:

1. Since `hasGithubPlus` was already true, the boolean flag did not change that. Such a default configuration does not make much sense.
2. Strings that are valid numbers are automagically converted to a number (see `--followerCount` / `-fc`). This only applies if the object to be parsed is an array of strings.

### Good to know when parsing strings

- `-` is a reserved prefix. Any string that starts with `-` will be treated as a flag and not a flag argument. Passing arguments such as `["--password", "-x8ap!"]` results in undefined behavior
- If you really need to parse a value that starts with `-`, consider reading it from a file instead. This is a little less convenient but works for any value
- Later values will overwrite earlier values. `["--password", "abc", "--password", "xyz"]` will parse to `password: "xyz"`

## More examples

For more examples, [check the extensive test suites](test) or play in the dedicated [Code Sandbox](https://codesandbox.io/s/tinyparse-sandbox-pknk4?file=/src/index.ts)
