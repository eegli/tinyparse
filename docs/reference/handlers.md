# Handlers

> This document specifies how **handlers** work and how they can be used. A handler is either a subcommand handler or the default handler.

Because of the way the builder pattern works with TypeScript, you should always declare any options and globals _before_ you set any subcommand handlers. Handlers "see" what has previously been chained to the parser but now what will come. Hence, TypeScript will complain, although the parsing result will be correct.

The order of operations when parsing is as follows:

1. **Options/flags are collected** and validated
2. **Globals are set** using the global setter function and the options as arguments
3. **A bound handler is created** with the globals, the options, and the positional arguments
4. An object with a `.call()` method is returned

Setting a default handler is optional. If a parser is created without a default handler, it simply does nothing when no subcommand matches. Hence, the minimal (noop) parser looks like this:

```ts
new Parser().defaultHandler().parse([]).call();
```

Because you might want to do things _before_ invoking a handler, `.parse([...args])` returns another object with a `.call()` method. You can invoke it anytime and either a subcommand or the default handler will be called.

## Declaring Handlers

A default handler can be declared either inline or externally, just like a subcommand handler. The difference between a subcommand and default handler is that the default handler has no constraint on the number of arguments it accepts. It simply receives all positional arguments. Other than that, it also has access to the globals and options.

```ts
import { Parser } from '@eegli/tinyparse';
import type { CommandHandler } from '@eegli/tinyparse';

const options = new Parser();

const defaultHandler: CommandHandler<typeof options> = ({
  args,
  globals,
  options,
}) => {
  console.log({ args, globals, options });
};

const executeHandler = new Parser()
  .defaultHandler(defaultHandler)
  .parse(['hello', 'world']).call;

// Time goes by...

executeHandler();

expect(consoleLog).toHaveBeenCalledWith({
  args: ['hello', 'world'],
  globals: {},
  options: {},
});
```

Default handlers can be a good place to handle things that Tinyparse is not opinionated about. For example, you can print an error to the console and tell the user that they should select one of the available subcommands.
