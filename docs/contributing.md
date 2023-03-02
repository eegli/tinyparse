# Contributing

> This document is work in progress.

PRs are welcome.

### Terminology

The internals of Tinyparse use a specific terminology.

| Term       | Meaning                                             | Context        |
| ---------- | --------------------------------------------------- | -------------- |
| Key        | A key of an object literal                          | Object literal |
| Key value  | A value corresponding to a key in an object literal | Object literal |
| Flag       | A long or short flag corresponding to a key         | Argv           |
| Flag value | A value corresponding to a flag                     | Argv           |
| Alias      | A long or short flag corresponding to another flag  | Argv           |

### Testing

Here's and overview of the testing strategy.

| Test type   | Test directory      |
| ----------- | ------------------- |
| Unit        | test/\*.test.ts     |
| Integration | test/integration/\* |
| End-to-end  | test/e2e/\*         |
| Types       | test/types/\*       |

All examples in the docs are also e2e tests. Integration tests are run with the native Node test runner instead of Jest.
