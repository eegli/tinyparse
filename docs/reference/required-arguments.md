# Required Arguments

A property - or flag - can be marked as required. If a required property is not present in the input, a `ValidationError` is thrown (see the [error handling docs](reference/error-handling.md)).

## Example

<!-- doctest: default -->

```ts
import { createParser } from '@eegli/tinyparse';

const { parseSync } = createParser(
  { userName: '' },
  {
    options: {
      userName: {
        required: true,
      },
    },
    decamelize: true,
  },
);

expect(() => {
  parseSync(); // Whoops, forgot username!
}).toThrow(new ValidationError('Missing required option --user-name'));
```
