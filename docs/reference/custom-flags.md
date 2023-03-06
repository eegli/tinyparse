# Custom Flags

By default, an argument's _long flag_ is created automatically by prefixing it with two hyphens: `userName` -> `--userName`. _Short flags_, i.e., short aliases for long flags, are not automatically generated, they need to be set explicitly. Both flags can be customized on a per-argument basis.

When specifying custom flags/aliases, it does not matter how you prefix the flag (with or without a hyphen, or more!). Internally, the flag is always trimmed to start with a _single_ hyphen. `---v`, `--v` and `v` will all be converted and map to `-v`.

Although it is generally recommended that a short flag is actually short, i.e., a single character, Tinyparse does not care about the actual length.

**Good to know**

- Enabling global [decamelization](reference/decamelize-variables) has no effect on custom long and short flags, only on the default long flag creation.
- Every key can have at most two aliases (one long and one short flag). That means, if the key `userName` gets `name` as custom long flag, arguments such as `--userName` will be ignored.

## Example

<!-- doctest: custom flags -->

```ts
import { createParser } from '@eegli/tinyparse';

const { parse } = createParser(
  {
    userName: '',
    verbose: false,
  },
  {
    options: {
      userName: {
        longFlag: 'user',
      },
      verbose: {
        shortFlag: 'v',
      },
    },
  }
);
const parsed = await parse(['-v', '--user=john']);
expect(parsed.verbose).toBe(true);
expect(parsed.userName).toBe('john');
```
