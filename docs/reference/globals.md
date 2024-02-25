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

expect(consoleLog).toHaveBeenCalledWith('Hello, John!');
```

## External Declaration

You can also declare the global setter function outside of the building phase by taking a break after declaring your options and using the `GlobalSetter` helper type. Using this type will get you autocompletion and type checking for the `options` parameter:

```ts
import { Parser } from '@eegli/tinyparse';
import type { GlobalSetter } from '@eegli/tinyparse';

type Options = typeof options;

const options = new Parser().option('verbose', {
  longFlag: '--verbose',
  defaultValue: false,
});

const globalSetter: GlobalSetter<Options> = (options) => ({
  log: (message: string) => {
    if (options.verbose) {
      console.log(message);
    }
  },
});
const parser = options.setGlobals(globalSetter).defaultHandler();
```
