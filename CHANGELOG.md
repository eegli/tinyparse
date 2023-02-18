# @eegli/tinyparse

## 0.12.0

### Minor Changes

- 3aa1583: New API: `parseSync` is the synchronous alternative to `parse`:

  ```ts
  const { parseSync } = createParser({ greeting: '' });
  const parsed = parseSync(['--greeting', 'hello']);
  parsed; // { greeting: "hello" }
  ```

## 0.12.0

### Minor Changes

- 35df95c: New API: `parseSync` is the synchronous alternative to `parse`:

  ```ts
  const { parseSync } = createParser({ greeting: '' });
  const parsed = parseSync(['--greeting', 'hello']);

  parsed; // { greeting: "hello" }
  ```

## 0.11.0 and older

Please check the [changelog on GitHub](https://github.com/eegli/tinyparse/releases/tag/v0.11.0)
