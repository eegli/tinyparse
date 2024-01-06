# Quickstart

## Install

Node.js v18 or later is required.

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

For an advanced example, see [examples](/examples.md).

Tinyparse is made for parsing simple user input. It can process **command line input**, i.e., `process.argv` - an array of strings - and build an object literal from it. The object to parse _into_ may only have `string`, `number` or `boolean` property values. These three primitive types are further denoted as a `Value` type.

CLI arguments can either be separated by a whitespace or an equal sign.

```ts
import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';

const defaultValues = {
  username: '',
  active: false,
};

const { parse, parseSync } = createParser(defaultValues);

const parsed1 = await parse(['hello', '--username', 'john', '--active']);
const parsed2 = parseSync(['hello', '--username=john', '--active']);

assert.deepStrictEqual(parsed1, parsed2);

assert.deepStrictEqual(parsed1, {
  username: 'john',
  active: true,
  _: ['hello'],
});
```

`createParser` builds both an asynchronous (`parse`) and synchronous (`parseSync`) parser. Apart from their different return types, both functions do the exact same thing.
