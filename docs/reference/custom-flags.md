# Custom Flags

You can optionally specify custom short and long flags for each argument. By default, an argument's long flag is created by prefixing it with two hyphens: `userName` -> `--userName`.

Optionally, short flags can be specified for each argument. They act like an alias for the default long flag. It does not matter how you prefix your short flag alias (with or without a hyphen, or more!). Internally, the flag is always trimmed to start with a _single_ hyphen. `---v`, `--v` and `v` will all be converted and map to `-v`.

Although it is generally recommended that a short flag is actually short, i.e., a single character, Tinyparse does not care about the actual length. However, since short flags are _expected_ to be short, they are _never_ [decamelized](reference/decamelize-variables).

## Example

<!-- doctest: handles short flags -->

```ts
import { createParser } from '@eegli/tinyparse';

const { parse } = createParser(
  {
    user: '',
    verbose: false,
  },
  {
    options: {
      user: {
        shortFlag: '-u',
      },
      verbose: {
        shortFlag: 'v',
      },
    },
  }
);
const parsed = await parse(['-v', '-u', 'eegli']);
expect(parsed.verbose).toBe(true);
expect(parsed.user).toBe('eegli');
```
