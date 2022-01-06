# Tinyparse

### Highly opiniated, type-safe parsing module for object literals and Node's `process.argv`.

_Like [Joi](https://joi.dev/) and [Yargs](https://yargs.js.org/) had a baby but it's not as capable as its parents._

- TypeScript first
- Promise-based
- Fast, zero dependencies
- Supports object literals and arrays of strings

**I use this mostly for other pet projects of mine, so it comes with some opinions.**

- It **exports a single parser factory function** that accepts either an object literal or array of strings (usually, `process.argv.slice(2)`)

- The argument to the factory is a "base" or default configuration object. It returns a typed parser function. All **matching keys of the same type as the default config are updated**, the rest is taken from the base.

## Usage

The default object needs to specify the **exact types** that are desired for the parsed arguments. The exact values of `defaultInput` don't matter as long as the types are correct.

```ts
import { parserFactory } from '@eegli/tinyparse';

const defaultConfig = {
  name: '', // Want string
  age: 0, // Want number
  hasDog: true, // Want boolean
};

// Specify required object keys
const createConfig = parserFactory(defaultConfig, {
  required: ['name'],
});

// Parse arbitrary input
const parsedInput = await parse({
  name: 'eric',
  age: 12,
  location: 'World', // Does not exist on config!
});

/* -- parsedInput 
{
  name: 'eric',
  age: 12,
  hasDog: true
}
*/
```

### Required options

The factory may accept an optional array of required keys from the default configuration. If they are not provided in the user input, the promise is rejected.

```ts
const defaultConfig = {
  name: '', // Want string
  age: 0, // Want number
  hasDog: true, // Want boolean
};

const createConfig = parserFactory(defaultConfig, {
  required: ['name', 'age'],
});

const parsedInput = await parse({
  name: 'eric',
});

// --> Rejects :(
// 'Missing required config property "age"'
```

### Short flag options

This only affects string parsing for CLI apps. The factory may accept an object literal that maps [short flag](https://oclif.io/blog/2019/02/20/cli-flags-explained#short-flag) keys to their long siblings.

```ts
const defaultConfig = {
  firstName: '', // Want string
  age: 0, // Want number
  hasDog: true, // Want boolean
};

const createConfigTwo = parserFactory(defaultConfig, {
  shortFlags: { fn: 'firstName' },
});

const parsedInput = await parse(['-fn', 'eric', '--age', '12']);

/* -- parsedInput 
{
  firstName: 'eric',
  age: 12,
  hasDog: true
}
*/
```

For more examples, [check the extensive test suites](./src/test).

## Limitations

1. The object literal argument can only have strings, numbers and booleans as object keys
2. Invalid keys are ignored, invalid value types are rejected
