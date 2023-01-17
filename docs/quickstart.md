# Quickstart

Tinyparse is made for parsing simple user input. It is primarily designed to process **command line input** - i.e., `process.argv`, an array of strings - but it can parse **object literals** just as well. The object to parse _into_ may only have `string`, `number` or `boolean` property values.

Tinyparse

```ts
import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';

const defaultValues = {
  username: '',
  active: false,
};

const { parse } = createParser(defaultValues);

const parsed1 = await parse({ username: 'eegli', active: true });
const parsed2 = await parse(['--username', 'eegli', '--active']);

assert.deepStrictEqual(parsed1, { username: 'eegli', active: true });
assert.deepStrictEqual(parsed2, { username: 'eegli', active: true, _: [] });
```

## Install

Node.js v14 or later is required.

```bash
yarn add @eegli/tinyparse
```

or

```bash
npm i @eegli/tinyparse
```

## Usage

Tinyparse binds a parser to some default values you feed it.

`createParser(defaultValues, options = {})`

- `defaultValues: Record<string, string | number | boolean>`: An object literal that specifies the **exact types** that are desired for the parsed arguments. Its **exact values** will be used as a fallback/default.

- `options: object`: Options object. You can specify both a _file flag_ (whose flag value will point to a file) and options per key.

Note that most arguments and options are optional. IntelliSense and
TypeScript will show you the detailed signatures and what is required.

The factory creates a `help()` function that can be used to print all available options, sorted by `required`. This is most useful for CLI apps.

## Example

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
        shortFlag: 'ghp',
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

process.argv = ['profile', '--username', 'eegli', '--age', '12', '-ghp'];

const parsedArgv = await parse(process.argv);

// When parsing an array of strings, positional arguments are
// available on the _ property
assert.deepStrictEqual(parsedArgv, {
  _: ['profile'],
  username: 'eegli',
  age: 12,
  hasGithubProfile: true,
});

// Print available options with descriptions. Optionally, set a
// title and a base command showing the usage of positional
// arguments. Everything else is auto-generated
help('CLI usage', 'my-cli <message> [flags]');
`CLI usage

my-cli <message> [flags]

Required flags
   --username [string]
   Your custom username

Optional flags
   --age [number]

   -ghp, --hasGithubProfile [boolean]
   Indicate whether you have a Github profile`;
```
