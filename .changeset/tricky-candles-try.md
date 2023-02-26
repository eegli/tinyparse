---
'@eegli/tinyparse': minor
---

Arguments can now also separated by an equal sign instead of a whitespace. The following two are equivalent:

```ts
parse(['--username=john']);
parse(['--username', 'john']);
```
