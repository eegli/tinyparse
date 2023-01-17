# Error Handling

If the parser encounters an _invalid value_, i.e., something that is _not_ of type `string | number | boolean`, it throws an error with a reason. Similarly, a `ValidationError` is thrown for _missing required arguments_. You can use it to inspect what has gone wrong.

## Examples

_Missing required arguments._

<!-- doctest: rejects for missing args -->

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
  await parse(); // Whoops, forgot username!
} catch (error) {
  if (error instanceof ValidationError) {
    expect(error.message).toBe('"username" is required');
  }
}
```

_Invalid types._

<!-- doctest: rejects invalid types -->

```ts
import { createParser, ValidationError } from '@eegli/tinyparse';

const { parse } = createParser({ username: '' });
try {
  await parse({ username: ['eegli'] });
} catch (error) {
  if (error instanceof ValidationError) {
    expect(error.message).toBe(
      'Invalid type for "username". Expected string, got object'
    );
  }
}
```