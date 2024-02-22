# Contributing

> This document is work in progress.

PRs are welcome.

### Testing

Here's and overview of the testing strategy.

| Test type   | Test directory      | Notes                                        |
| ----------- | ------------------- | -------------------------------------------- |
| Unit        | test/\*.test.ts     | -                                            |
| Integration | test/integration/\* | Documentation quickstart & advanced examples |
| End-to-end  | test/e2e/\*         | General documentation examples               |
| Types       | test/types/\*       | -                                            |

All examples in the docs are also e2e tests. Integration tests are run with the native Node test runner instead of Jest.
