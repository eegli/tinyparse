# Error Handling

> This document describes how **errors** originated from parsing can be handled.

Tinyparse is not opinionated about errors, it throws an ugly error by default. However, you can easily catch it, extract the message and show it to the user.

Parsing may fail if:

- A subcommand is called with an invalid number of arguments
- A required flag is missing
- A flag is called with an invalid value

If any of these errors - they are _parsing errors_ - occur, a `ValidationError` will be thrown. It contains a `message` property that you can show to the user. Note that errors thrown when bootstrapping the parser are regular `Error` instances.

**If you do not provide an error handler, the error will be thrown as usual.** When an error handler is provided, the app is guaranteed to never throw if you have configured it correctly. You can provide an error handler using the `ErrorParams` type and set it with the `onError` method:

```ts
import { Parser } from '@eegli/tinyparse';
import type { ErrorParams } from '@eegli/tinyparse';

const errorHandler = ({ error, usage }: ErrorParams) => {
  console.log(error.message);
  // Missing required option --foo
  console.log(usage);
  // Usage: ...
};
new Parser()
  .option('foo', {
    longFlag: '--foo',
    required: true,
    defaultValue: false,
  })
  .onError(errorHandler)
  .defaultHandler()
  .parse(['--bar'])
  .call();
```

The error hander will get the `ValidationError` as its first argument and the usage/help string as the second. From there, you can extract the message and customize what you want to display to the user.
