# @eegli/tinyparse

## 0.18.3

### Patch Changes

- d47c225: Upgrade dependencies
- 7889049: Fix Handler utility types to preserve handler return type

## 0.18.2

### Patch Changes

- a9bfe77: Fix downcast utility type to default to `string[]`

## 0.18.1

### Patch Changes

- d8767c5: Parsers now expose default options
- d8767c5: New utility types that allow for modular handler declaration!

## 0.18.0

### Minor Changes

- cf32aeb: Tinyparse is now asynchronous by default, allowing you to use async handlers and setters!

## 0.17.1

### Patch Changes

- bd1d97e: Make usage text available in handlers
- bd1d97e: Refine usage text formatting
- bd1d97e: Rename `appName` to `command` in meta options

## 0.17.0

### Minor Changes

- f1fb8fe: - Subparsers: Added support for subparsers
  - Error handling: Slight API change

## 0.16.0

### Minor Changes

- bc648c4: The API has fully changed - it is now easier and cleaner than ever to configure a parser and support for subcommands has been added!

## 0.15.1

### Patch Changes

- 498b64c: Include the README in the published package

## 0.15.0

### Minor Changes

- 258ab05: Increase minimum node version to 18 and upgrade dependencies

## 0.14.0

### Minor Changes

- fa70f34: Arguments can now also separated by an equal sign instead of a whitespace. The following two are equivalent:

  ```ts
  parse(["--username=john"]);
  parse(["--username", "john"]);
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
  const { parseSync } = createParser({ greeting: "" });
  const parsed = parseSync(["--greeting", "hello"]);
  parsed; // { greeting: "hello" }
  ```

## 0.11.0 and older

Please check the [changelog on GitHub](https://github.com/eegli/tinyparse/releases/tag/v0.11.0)
