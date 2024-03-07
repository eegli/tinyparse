# Handlers

> This document specifies how **handlers** work and how they can be used. A handler is either a subcommand handler or the default handler.

A handler is either a _subcommand handler_ identified by a matching positional argument or the _default handler_. They execute a piece of code.

- All handlers can be **asynchronous** - they are always awaited
- All Handlers can **return any value** - it is ignored

Because of the way the builder pattern works with TypeScript, you should always declare any options and globals _before_ you set any (subcommand) handlers. Handlers "see" what has previously been chained to the parser but not what will come. Hence, TypeScript will complain, although the parsing result will be correct.

## How Parsing Works

The **order of operations when parsing** is as follows:

1. The _first_ positional argument is matched against a keyword that identifies a **subparser**. If a subparser is found, the remaining arguments are passed to the subparser. This could go on recursively if the subparser has its own subparsers. If no subparser is found, the token is matched against a possible **metacommand** (like `help` or `version`). If no metacommand is registered, we check for a **subcommand**. If no subcommand is found, the default handler is chosen to be invoked later.

2. **Options/flags are collected** and validated
3. **Globals are set** using the global setter function and the options as arguments
4. **A bound handler is created** with the globals, the options, and the positional arguments
5. An object with a `.call()` method is returned, which, when called, will invoke the default or subcommand handler

Setting a default handler is optional. If a parser is created without a default handler, it simply does nothing when no subcommand matches. Hence, the minimal (noop) parser invocation looks like this:

```ts
new Parser().defaultHandler().parse([]).call();
```

Because you might want to do things _before_ invoking a handler, `.parse([...args])` returns another object with a `.call()` method. You can invoke it anytime and either a subcommand or the default handler will be called.

## Declaring Handlers

There are a handful of utility types to declare handlers. The workflow was already demonstrated with [subcommands](reference/subcommands.md?id=external-declaration). The following example demonstrates how handlers can be declared:

```ts
import { Parser } from '@eegli/tinyparse';
import type { WithArgs, WithGlobals, WithOptions } from '@eegli/tinyparse';

// Type alias for the future
type BaseParser = typeof baseParser;

// Set up the base parser with globals and options
const baseParser = new Parser()
  .option('foo', {
    longFlag: '--foo',
    defaultValue: 'default',
  })
  .setGlobals(() => ({
    bar: 'baz',
  }));

// I only need an array of strings
type FirstHandler = WithArgs<string[]>;

const firstHandler = ({ args }: FirstHandler) => {};

// I need a tuple of two strings, the options, and the globals
type SecondHandler = WithArgs<[string, string]> &
  WithOptions<BaseParser> &
  WithGlobals<BaseParser>;

const secondHandler = ({ args, options, globals }: SecondHandler) => {};

// I have no strict requirements but I need access to the options and globals
type DefaultHandler = WithArgs<string[]> &
  WithGlobals<BaseParser> &
  WithOptions<BaseParser>;

const defaultHandler = ({ args, globals, options }: DefaultHandler) => {
  console.log({ args, globals, options });
};

const parser = baseParser
  .subcommand('first', {
    // An array of strings is fine
    args: 'args',
    handler: firstHandler,
  })
  .subcommand('second', {
    // Match the type signature
    args: ['arg1', 'arg2'] as const,
    handler: secondHandler,
  })
  .defaultHandler(defaultHandler);
```

### Default Handlers vs Subcommand Handlers

A default handler can be declared either inline or externally, just like a subcommand handler. The difference between a subcommand and default handler is that the default handler has _no constraint_ on the number of arguments it accepts. It simply receives all positional arguments. Other than that, it also has access to the globals and options.

Default handlers can be a good place to handle things that Tinyparse is not opinionated about. For example, you can print an error to the console and tell the user that they should select one of the available subcommands.
