# Tinyparse

### Highly opiniated, type-safe parsing module for object literals and Node's `process.argv`.

I use this mostly for other pet projects of mine, but why not make it public.

- TypeScript first
- Promise-based
- Fast, zero dependencies
- Supports object literals and arrays of strings

The whole thing is quite opinionated and assumes some things. It exports a single parser factory function that accepts either an object literal or array of strings (usually, `process.argv.slice(2)`)

Whatever config is parsed with the `parser` function created by the factory will get the key-value pairs from the default config, but with updated keys if they are valid.

```ts
import { parserFactory } from '@eegli/tinyparse';

const defaultInput = {
  name: '',
  age: 0,
  hasDog: true,
};

const userInput = {
  name: 'eric',
  age: 12,
  what: 'is he doing',
};

const parse = parserFactory(defaultInput);
const parsedInput = await parse(userInput);

/* -- parsedInput 
{
  name: 'eric',
  age: 12,
  hasDog: true
}
*/
```

1. The object literal argument can only have strings, numbers and booleans as object keys
2. It expects an object that specifies the **exact types** that are desired for the parsed arguments. The exact values of `defaultInput` don't matter as long as the types are correct.
3. Invalid keys are ignored, invalid value types are rejected
