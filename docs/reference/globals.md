# Globals

> This document describes how **globals** can be used to configure the parser.

Often times, subcommands need access to a shared object such as a database connection or a logger. You can attach such an object in the building phase and it will be passed to the handler of each subcommand (and the default handler). Setting the globals is done via a function that has access to all the options that have been collected while parsing.

Globals are expected to be static and should only be set once. _Calling `.setGlobals()` multiple times will override the previous value._

```ts
import { Parser } from '@eegli/tinyparse';

const globals = {
  database: (name: string) => name,
};

new Parser()
  .setGlobals(() => globals)
  .defaultHandler(({ globals }) => {
    const user = globals.database('John');
    console.log(`Hello, ${user}!`);
  })
  .parse([])
  .call();

// 'Hello, John!'
```

## External Declaration

You can also declare the global setter function outside of the building phase by taking a break after setting the options/flags and using the `InferOptions` helper type to annotate the `options` parameter. Using this type will get you autocompletion and type checking for the `options` parameter:

```ts
import { Parser } from '@eegli/tinyparse';
import type { InferOptions } from '@eegli/tinyparse';

const parserOptions = new Parser().option('verbose', {
  longFlag: '--verbose',
  defaultValue: false,
});

type Options = InferOptions<typeof parserOptions>;

const globalSetter = (options: Options) => ({
  log: (message: string) => {
    // Strong typing!
    if (options.verbose) {
      console.log(message);
    }
  },
});
const parser = parserOptions.setGlobals(globalSetter).defaultHandler();
```
