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

Setting a default handler is optional. If a parser is created without a default handler, it simply does nothing when no subcommand matches. Hence, the minimal (noop) parser invocation looks like this:

```ts
new Parser().defaultHandler().parse([]).call();
```

Because you might want to do things _before_ invoking a handler, `.parse([...args])` returns another object with a `.call()` method. You can invoke it anytime and either a subcommand or the default handler will be called.

## Declaring Handlers

A default handler can be declared either inline or externally, just like a subcommand handler. The difference between a subcommand and default handler is that the default handler has no constraint on the number of arguments it accepts. It simply receives all positional arguments. Other than that, it also has access to the globals, options and usage text.

- All handlers can be _asynchronous_ - they are always awaited
- Handlers can return _any value_ - it is ignored

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

options.defaultHandler(defaultHandler).parse(['hello', 'world']).call();
```

Default handlers can be a good place to handle things that Tinyparse is not opinionated about. For example, you can print an error to the console and tell the user that they should select one of the available subcommands. You can also log the usage text to the console so that the user knows what to do next. The usage text is the same as if the app were invoked with a help command or flag (if defined).

## Modular Declaration

In the above example, we use the `CommandHandler` utility type to declare the default handler. This will annotate the handler as a function taking an object literal with all parameters and returning anything.

However, your handler might return something that you'd like to assert in a testing scenario, and it might not need all parameters. With the `CommandHandler` type, you would need to pass values for `args`, `globals`, `options`, and `usage`. This is a bit cumbersome.

To solve this, you can **declare default and subcommand handlers more modularly** by specifiying _exactly_ what parameters they need using the `Handler*` utility types. This will also preserve the return type:

```ts
import { Parser } from '@eegli/tinyparse';
import type {
  HandlerParams,
  HandlerGlobals,
  HandlerOptions,
} from '@eegli/tinyparse';

const options = new Parser().option('foo', {
  longFlag: '--foo',
  defaultValue: 'default',
});

type Globals = HandlerGlobals<typeof options>;
type Options = HandlerOptions<typeof options>;

// Handler that only needs options and globals
type Params = HandlerParams<Options, never, Globals>;

const defaultHandler = ({ globals, options }: Params) => {
  console.log({ globals, options });
  // In a test, assert that true is returned
  return true;
};

// Other possible options...

// No parameters
type NoParamsHandler = HandlerParams;
const noopHandler: NoParamsHandler = () => {};

// Positional arguments and options only
type ParamsWithArgs = HandlerParams<Options, [string]>;
const handlerWithArgs = ({ options, args }: ParamsWithArgs) => {};

// Usage only
type ParamsWithUsage = HandlerParams<never, never, never, string>;
const handlerWithUsage = ({ usage }: ParamsWithUsage) => {};
```

In the above example, we specify a handful of handlers, each of which only needs a subset of what Tinyparse feeds it. `HandlerParams` has the following signature:

```ts
type HandlerParams<
  Options extends FlagValueRecord = never,
  Args extends string[] = never,
  Globals extends AnyGlobal = never,
  Usage extends string = never,
> = (...)
```

In summary, the `CommandHandler` can be a useful shortcut, but if you only need a subset of the parameters and/or would like to preserve the return type, it might make sense to declare the handler more modularly.
