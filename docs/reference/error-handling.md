# Error Handling

If the parser encounters an _invalid value_, i.e., something that is _not_ of type `Value` `(string | number | boolean)`, it throws an error with a reason. Similarly, a `ValidationError` is thrown for _missing required arguments_. You can use it to inspect what has gone wrong.

## Examples

Missing required arguments.

<!-- doctest: error handling, rejects for missing args -->

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
  expect(error).toBeInstanceOf(ValidationError);
  expect(error).toHaveProperty('message', 'Missing required flag --username');
}
```

Invalid types.

<!-- doctest: error handling, rejects invalid types -->

```ts
import { createParser, ValidationError } from '@eegli/tinyparse';

const { parse } = createParser({ age: 0 });
try {
  await parse(['--age']);
} catch (error) {
  expect(error).toBeInstanceOf(ValidationError);
  expect(error).toHaveProperty(
    'message',
    'Invalid type for --age. "true" is not a number'
  );
}
```
