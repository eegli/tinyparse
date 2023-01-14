# Error Handling

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
    // Safely access error message
    console.log(e.message); // '"username" is required'
  }
}
```
