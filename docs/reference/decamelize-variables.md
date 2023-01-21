# Decamelize Variables

In JavaScript, sane devs follow the camel case convention to name variables. However, CLI flags are typically spelled all lowercase with a `-` separator. By turning on `decamelization`, the parser will look out for the decamelized version of each flag and treat it as an alias.

Tinyparse implements decamelization as follows:

- `userName` → `user-name`
- `username` → `username`
- `Username` → `username`

Note that decamelized aliases are only respected for CLI arguments, i.e., array of strings, and not object literals.

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
