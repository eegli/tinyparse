# Handlers

> This document specifies how **handlers** work and how they can be used. A handler is either a subcommand handler or the default handler.

Because of the way the builder pattern works with TypeScript, you should always declare any options and globals _before_ you set any subcommand handlers. Handlers "see" what has previously been chained to the parser but not what will come. Hence, TypeScript will complain, although the parsing result will be correct.

## How Parsing Works

The **order of operations when parsing** is as follows:

1. The _first_ positional argument is matched against a token that identifies a **subparser**. If a subparser is found, the remaining arguments are passed to the subparser. This could go on recursively if the subparser has its own subparsers. If no subparser is found, the token is matched against a possible **metacommand** (like `help` or `version`). If no metacommand is registered, we check for a **subcommand**. If no subcommand is found, the default handler is chosen to be invoked later.

2. **Options/flags are collected** and validated
3. **Globals are set** using the global setter function and the options as arguments
4. **A bound handler is created** with the globals, the options, and the positional arguments
5. An object with a `.call()` method is returned, which, when called, will invoke the default or subcommand handler

Setting a default handler is optional. If a parser is created without a default handler, it simply does nothing when no subcommand matches. Hence, the minimal (noop) parser looks like this:

```ts
new Parser().defaultHandler().parse([]).call();
```

Because you might want to do things _before_ invoking a handler, `.parse([...args])` returns another object with a `.call()` method. You can invoke it anytime and either a subcommand or the default handler will be called.

## Declaring Handlers

A default handler can be declared either inline or externally, just like a subcommand handler. The difference between a subcommand and default handler is that the default handler has no constraint on the number of arguments it accepts. It simply receives all positional arguments. Other than that, it also has access to the globals, options and usage text.

```ts
import { Parser } from '@eegli/tinyparse';
import type { CommandHandler } from '@eegli/tinyparse';

const options = new Parser();

const defaultHandler: CommandHandler<typeof options> = ({
  args,
  globals,
  options,
  usage,
}) => {
  console.log({ args, globals, options, usage });
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
  usage: expect.any(String),
});
```

Default handlers can be a good place to handle things that Tinyparse is not opinionated about. For example, you can print an error to the console and tell the user that they should select one of the available subcommands. You can also log the usage text to the console so that the user knows what to do next. The usage text is the same as if the app were invoked with a help command or flag (if defined).
