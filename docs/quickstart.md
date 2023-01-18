# Quickstart

Tinyparse is made for parsing simple user input. It is primarily designed to process **command line input** - i.e., `process.argv`, an array of strings - but it can parse **object literals** just as well. The object to parse _into_ may only have `string`, `number` or `boolean` property values.

```ts
import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';

const defaultValues = {
  username: '',
  active: false,
};

const { parse } = createParser(defaultValues);

const parsed1 = await parse({ username: 'eegli', active: true });
const parsed2 = await parse(['hello', '--username', 'eegli', '--active']);

assert.deepStrictEqual(parsed1, {
  username: 'eegli',
  active: true,
});
assert.deepStrictEqual(parsed2, {
  username: 'eegli',
  active: true,
  _: ['hello'],
});
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
