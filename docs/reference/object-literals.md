# Parsing Object Literals

Tinyparse is primarily designed to parse CLI flags and arguments. During this process, it converts the input to an object literal, which is then validated according to the rules your set.

This means that you can also use it to parse object literals directly. TypeScript is smart enough to let you know what it expects.

## Examples

<!-- doctest: object literals, works -->

Parse a valid value.

```ts
import { createParser } from '@eegli/tinyparse';

const { parse } = createParser({ username: '' });
const parsed = await parse({ username: 'eegli' });

expect(parsed.username).toBe('eegli');
```

<!-- doctest: object literals, rejects -->

In the following example, a `ValidationError` will be thrown because non-primitive values are not supported.

```ts
import { createParser } from '@eegli/tinyparse';

const { parse } = createParser({ username: '' });

await expect(parse({ username: ['eegli'] })).rejects.toThrow();
```
