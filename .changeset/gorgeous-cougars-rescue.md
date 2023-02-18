---
'@eegli/tinyparse': minor
---

New API: `parseSync` is the synchronous alternative to `parse`:

```ts
const { parseSync } = createParser({ greeting: '' });
const parsed = parseSync(['--greeting', 'hello']);

parsed; // { greeting: "hello" }
```
