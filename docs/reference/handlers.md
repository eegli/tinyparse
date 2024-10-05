# Handlers

> This document specifies how **handlers** work and how they can be used. A handler is either a subcommand handler or the default handler.

A handler is either a _subcommand handler_ identified by a matching positional argument or the _default handler_. They execute a piece of code.

- All handlers can be **asynchronous** - they are always awaited
- All Handlers can **return any value** - it is ignored

Because of the way the builder pattern works with TypeScript, you should always declare any options and globals _before_ you set any (subcommand) handlers. Handlers "see" what has previously been chained to the parser but not what will come. Hence, TypeScript will complain, although the parsing result will be correct.

## How Parsing Works

The **order of operations when parsing**, that is, when `.parse([...args]).call()` is called, is as follows:

1. The _first_ positional argument is matched against a keyword that identifies either:

   - A **subparser**. If a subparser is found, the remaining arguments are passed to the subparser. This could go on recursively if the subparser has its own subparsers.
   - A **metacommand** (like `help` or `version`)
   - A **subcommand**

   If no match is found, the default handler is chosen to be invoked later.

2. A function named `call` is prepared that will do the following when invoked:

   - **Validate and collect** options/flags
   - **Set globals** using the global setter function and the options as arguments
   - If a subcommand is matched, its **arguments** are collected and validated

3. An object containing the `call` function is returned, which, when called, will invoke the default or subcommand handler. This is because you might want to do things _before_ invoking a handler. You can invoke `call` anytime and either a subcommand or the default handler will be called.

Setting a default handler is optional. If a parser is created without a default handler, it simply does nothing when no subcommand matches. Hence, the minimal (noop) parser invocation looks like this:

```ts
new Parser().defaultHandler().parse([]).call();
```

## Declaring Handlers

There are a handful of utility types to declare handlers. The workflow has already been demonstrated with [subcommands](reference/subcommands.md?id=external-declaration). The following example further demonstrates how handlers can be declared:

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
  .globals(() => ({
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
