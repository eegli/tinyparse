# Error Handling

Tinyparse is not opinionated about errors, it throws an ugly error by default. However, you can easily catch it, extract the message and show it to the user. See the [advanced example](/advanced-example.md).

Parsing may fail if:

- A subcommand is called with an invalid number of arguments
- A required flag is missing
- A flag is called with an invalid value

If any of these errors - they are _parsing errors_ - occur, a `ValidationError` will be thrown. It contains a `message` property that you can show to the user. Note that errors thrown when bootstrapping the parser are regular `Error` instances.

## Examples

Missing required arguments.

<!-- doctest: rejects for missing args -->

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
  },
);

expect(() => {
  parseSync(); // Whoops, forgot username!
}).toThrow(new ValidationError('Missing required option --username'));
```

Invalid types.

<!-- doctest: rejects invalid types -->

```ts
import { createParser, ValidationError } from '@eegli/tinyparse';

const { parseSync } = createParser({ age: 0 });

expect(() => {
  parseSync(['--age']);
}).toThrow(
  new ValidationError('Invalid type for --age. "true" is not a number'),
);
```
