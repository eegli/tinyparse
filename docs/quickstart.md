# Quickstart

Tinyparse is made for parsing simple user input. It can process **command line input**, i.e., `process.argv` - an array of strings - and build an object literal from it. The object to parse _into_ may only have `string`, `number` or `boolean` property values. These three primitive types are further denoted as a `Value` type.

```ts
import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';

const defaultValues = {
  username: '',
  active: false,
};

const { parse, parseSync } = createParser(defaultValues);

const parsed1 = await parse(['hello', '--username', 'eegli', '--active']);
const parsed2 = parseSync(['hello', '--username', 'eegli', '--active']);

assert.deepStrictEqual(parsed1, parsed2);

assert.deepStrictEqual(parsed1, {
  username: 'eegli',
  active: true,
  _: ['hello'],
});
```

`createParser` builds both an asynchronous (`parse`) and synchronous (`parseSync`) parser. Apart from their different return types, both functions do the exact same thing.

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

- `defaultValues: Record<string, Value>`: An object literal that specifies the **exact types** that are desired for the parsed arguments. Its **exact values** will be used as a fallback/default.

- `options: object`: Options object. You can specify both a _file flag_ (whose flag value will point to a file) and options per key.

Note that most arguments and options are optional. IntelliSense and
TypeScript will show you the detailed signatures and what is required.

### Advanced Example

```ts
import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';

const defaultValues = {
  name: '',
  hasGithubProfile: false,
  hasGithubPlus: true,
  followerCount: 0,
  birthYear: '',
};
const { parse } = createParser(defaultValues, {
  options: {
    followerCount: {
      required: true,
      shortFlag: '-fc',
    },
    hasGithubProfile: {
      longFlag: 'github',
    },
  },
});
const parsed = await parse([
  'congratulate', // Positional argument
  '--name', // Long flag
  '"John Smith"', // Value with spaces
  '--github', // Custom long boolean flag
  '--hasGithubPlus', // Another boolean flag
  '-fc', // Custom short flag
  '10', // Will be parsed as number
  'ignoredProperty', // This property is ignored
  '--birthYear', // Long flag
  '2018', // Will remain a string
]);

assert.deepStrictEqual(parsed, {
  _: ['congratulate'],
  name: '"John Smith"',
  hasGithubPlus: true,
  hasGithubProfile: true,
  followerCount: 10,
  birthYear: '2018',
});
```
