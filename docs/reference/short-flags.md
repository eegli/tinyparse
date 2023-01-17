# Short Flags

Optionally, **short flags** can be specified for each argument. It does not matter how you prefix your short flag alias (with or without a hyphen, or more!). Internally, the flag is always trimmed to start with a single hyphen. `---v`, `--v` and `v` will all be converted and map to `-v`.

## Examples

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
