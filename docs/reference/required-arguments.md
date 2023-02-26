# Required Arguments

A property - or flag - can be marked as required. If a required property is not present in the input, a `ValidationError` is thrown (see the [error handling docs](reference/error-handling.md)).

## Example

<!-- doctest: error handling, rejects for missing args -->

```ts
import { createParser } from '@eegli/tinyparse';

const { parseSync } = createParser(
  { username: '' },
  {
    options: {
      username: {
        required: true,
      },
    },
  }
);

expect(() => {
  parseSync(); // Whoops, forgot username!
}).toThrow('Missing required flag --username');
```
