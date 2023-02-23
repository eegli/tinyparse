# Error Handling

If the parser encounters an _invalid value_, i.e., something that is _not_ of type `Value` `(string | number | boolean)`, it throws an error with a reason. Similarly, a `ValidationError` is thrown for _missing required arguments_. You can use it to inspect what has gone wrong.

## Examples

Missing required arguments.

<!-- doctest: error handling, rejects for missing args -->

```ts
import { createParser, ValidationError } from '@eegli/tinyparse';

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
}).toThrow(new ValidationError('Missing required flag --username'));
```

Invalid types.

<!-- doctest: error handling, rejects invalid types -->

```ts
import { createParser, ValidationError } from '@eegli/tinyparse';

const { parseSync } = createParser({ age: 0 });

expect(() => {
  parseSync(['--age']);
}).toThrow(
  new ValidationError('Invalid type for --age. "true" is not a number')
);
```
