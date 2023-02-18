# @eegli/tinyparse

## 0.12.0

### Minor Changes

- 35df95c: New API: `parseSync` is the synchronous alternative to `parse`:

  ```ts
  const { parseSync } = createParser({ greeting: '' });
  const parsed = parseSync(['--greeting', 'hello']);

  parsed; // { greeting: "hello" }
  ```
