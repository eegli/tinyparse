# Required Arguments

A property - or flag - can be marked as required. If a required property is not present in the input, a `ValidationError` is thrown.

This works for object literals as well as string array arguments.

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
