# Tinyparse

![npm](https://img.shields.io/npm/v/@eegli/tinyparse) ![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/eegli/tinyparse/ci-unit-tests/main) [![codecov](https://codecov.io/gh/eegli/tinyparse/branch/main/graph/badge.svg?token=8MFDR4SWYM)](https://codecov.io/gh/eegli/tinyparse)

### Opiniated, type-safe parsing module for CLI arguments and object literals.

_Like [Joi](https://joi.dev/) and [Yargs](https://yargs.js.org/) had a baby but it's not as capable as its parents._

- Promise-based
- TypeScript first
- JSON file parsing support
- Zero dependencies

**I use this mostly for other pet projects of mine so it comes with some opinions**

Tinyparse is made for parsing simple user input.

- The object to parse into must have <`string`, `string` | `number` | `boolean`> key-value pairs (i.e., they must be _simple_)
- The same restriction applies to JSON files to parse - they must be simple

**How it works**

- The package **exports a single parser factory function** that creates a type-aware parser based on default values. The parser accepts either an object literal or array of strings (usually, `process.argv.slice(2)`)

- The parser checks the input and returns the defaults with updated matching property values

- Additionally, a `help()` function is returned from the factory that can be used to print all available options, sorted by `required`. This is most useful for CLI apps

## Installation

```bash
yarn add @eegli/tinyparse
```

or

```bash
npm i @eegli/tinyparse
```

## Usage Example

- The first argument to the parser factors - an object literal - must specify the **exact types** that are desired for the parsed arguments. Its **exact values** will be used as a fallback/default

- The second argument to the parser factory is an options object. You can specify both a "file flag" (whose value will point to a file) and options per key
- Pretty much everything is optional

```ts
import { createParser } from '@eegli/tinyparse';

const { help, parse } = createParser(
  // Default values. These will be used as defaults/fallback
  { username: '', hasGithubProfile: false },
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

await parse({ username: 'feegli' });
/* {
  username: 'feegli',
  hasGithubProfile: false,
} */

// Assuming there is a file "config.json" in directory "test"
await parse(['-gp', '--config', 'test/config.json']);
/* {
  username: 'eegli',
  hasGithubProfile: true,
} */

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

### Parsing required options

The factory accepts an optional array of option objects for each config key. If a required key is not present in the user input, a `ValidationError` is thrown.

This works for object literals as well as string array arguments.

Unknown arguments are ignored.

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
const { parse } = createParser({
  hasGithubProfile: false,
  hasGithubPlus: true,
  followerCount: 0,
});

const r2 = await parse([
  '--hasGithubProfile',
  '--hasGithubPlus',
  '--followerCount',
  '10',
]);
expect(r2).toStrictEqual({
  hasGithubPlus: true,
  hasGithubProfile: true,
  followerCount: 10,
});
```

Notice how:

1. Since `hasGithubPlus` was already true, the boolean flag did not change that. Such a default configuration does not make much sense.
2. Strings that are valid numbers are automagically converted to a number (see `--followerCount`). This only applies if the object to be parsed is an array of strings.

## More examples

For more examples, [check the extensive test suites](test) or play in the dedicated [Code Sandbox](https://codesandbox.io/s/tinyparse-sandbox-pknk4?file=/src/index.ts)
