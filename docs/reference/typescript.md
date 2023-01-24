# TypeScript

- The `ParserOptions` utility type can facilitate bootstrapping a parser.

Assuming you have an object with some default values, you can use the generic `ParserOptions` helper type to assemble the arguments for the parser outside of the factory function.

<!-- doctest: typescript, bootstrapping -->

```ts
import { createParser } from '@eegli/tinyparse';
import type { ParserOptions } from '@eegli/tinyparse';

const defaults = {
  abc: 'abc',
};

type CustomOptions = ParserOptions<typeof defaults>;

// Construct the options for a parser...
const options: CustomOptions = {
  options: {
    abc: {
      /* ... */
    },
  },
};
// ...and bootstrap it later
createParser(defaults, options);
```
