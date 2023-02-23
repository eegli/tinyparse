# Decamelize Variables

In JavaScript, sane devs follow the camel case convention to name variables. However, CLI flags are typically spelled all lowercase with a `-` separator. By turning on `decamelization`, the parser will look out for the decamelized version of each flag and treat it as an alias.

> Good to know: Enabling `decamelization` is equivalent to manually setting a decamelized `longflag` option for each variable. See [custom flags](reference/custom-flags.md).

Tinyparse implements decamelization as follows:

- `userName` → `user-name`
- `username` → `username`
- `Username` → `username`

**Good to know**

- If you specify any [short flag aliases](reference/custom-flags), be aware that they are _never_ decamelized. This is because they are expected to be very short in the first place.

## Example

<!-- doctest: decamelization -->

```ts
import { createParser } from '@eegli/tinyparse';

const { parse } = createParser(
  { userName: '' },
  {
    decamelize: true,
  }
);
const parsed = await parse(['--user-name', 'eegli']);

expect(parsed.userName).toBe('eegli');
```
