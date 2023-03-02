# @eegli/tinyparse

## 0.14.0

### Minor Changes

- fa70f34: Arguments can now also separated by an equal sign instead of a whitespace. The following two are equivalent:

  ```ts
  parse(['--username=john']);
  parse(['--username', 'john']);
  ```

## 0.13.0

### Minor Changes

- 7f65716: Drop support for parsing object literals: Having to support two very different APIs is exhausting. With a focus on CLI parsing, this lib can move faster.
- 5d14491: Custom long flags can now be specified analogously to custom short flags.

### Patch Changes

- ae1c933: All user configuration is now validated internally to make sure there are no conflicting values.
- 5d14491: Flags from the `help()` printer command are now ordered alphabetically.

## 0.12.0

### Minor Changes

- 10ef97f: New API: `parseSync` is the synchronous alternative to `parse`:

  ```ts
  const { parseSync } = createParser({ greeting: '' });
  const parsed = parseSync(['--greeting', 'hello']);
  parsed; // { greeting: "hello" }
  ```

## 0.11.0 and older

Please check the [changelog on GitHub](https://github.com/eegli/tinyparse/releases/tag/v0.11.0)
