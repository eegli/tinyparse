# Error Handling

> This document describes how **errors** originated from parsing can be handled.

Tinyparse is not opinionated about errors, it throws an ugly error by default. However, you can easily catch it, extract the message and show it to the user.

Parsing may fail if:

- A subcommand is called with an invalid number of arguments
- A required flag is missing
- A flag is called with an invalid value

If any of these errors - they are _parsing errors_ - occur, a `ValidationError` will be thrown. It contains a `message` property that you can show to the user. Note that errors thrown when bootstrapping the parser are regular `Error` instances.

**If you do not provide an error handler, the error will be thrown as usual.** When an error handler is provided, the app is guaranteed to never throw. You can provide an error handler using the `ErrorHandler` type and send it along in the `parse()` call:

```ts
import { Parser } from '@eegli/tinyparse';
import type { ErrorHandler } from '@eegli/tinyparse';

const errorHandler: ErrorHandler = (error, help) => {
  console.log(error.message, help);
  // "Missing required option --foo"
  // "Usage: my-app ...."
};

new Parser()
  .option('foo', {
    longFlag: '--foo',
    required: true,
    defaultValue: false,
  })
  .setHelp({
    appName: 'my-app',
    command: 'help',
  })
  .defaultHandler()
  .parse(['fuzz', '--bar'], errorHandler)
  .call();
```

The error hander will get the `ValidationError` as its first argument and the help string as the second. From there, you can extract the message and customize what you want to display to the user.
