# Subcommands and Positional Arguments

> This document describes how **subcommands** can be used to configure the parser.

Here, we define four subcommands and the positional arguments they expect. Every subcommand is **called with an object containing the positional arguments it expects, the options and the globals**:

```ts
import { Parser } from '@eegli/tinyparse';

const parser = new Parser()
  .subcommand('cmd-one', {
    args: ['arg1'] as const, // expects exactly one argument (strict)
    handler: ({ args }) => {
      // Tuple-length is inferred
      const [arg1] = args;
    },
  })
  .subcommand('cmd-none-strict', {
    args: [], // expects no arguments (strict)
    handler: () => {},
  })

  .subcommand('cmd-all', {
    args: 'args', // expects any number of arguments (non-strict)
    handler: ({ args }) => {
      // string[] is inferred
      const [arg1, ...rest] = args;
    },
  })
  .subcommand('cmd-none', {
    args: undefined, // expects no arguments (non-strict)
    handler: ({ args }) => {
      // string[] is inferred
      const [arg1, ...rest] = args;
    },
  })
  .defaultHandler();
```

In general, specifying a **tuple of any length for `args`** will make the parser **strict**. Specifying `undefined` or a string literal will make the parser **non-strict**.

What is the difference between specifying `undefined` and a string literal, e.g., `args`?

- A string literal is used to **hint** that your subcommand takes any number of arguments, which is reflected in the help text
- `undefined` is used to **hint** that your subcommand takes no arguments, which is reflected in the help text

Apart from that, they have the **same effect while parsing**. Since both configurations are non-strict, parsing never fails for too few or too many positional command arguments.

> One of the biggest advantages of using Tinyparse (together with TypeScript) is that it will **infer the number of subcommand arguments as a tuple** for you based on the subcommand's pattern. Hence, always make sure to annotate the `args` property with `as const` if you want to use the inferred type.

If the number of provided arguments does not match the pattern (i.e., any of `[]`, `[arg1]`, etc.), an error will be thrown. Here are cases when parsing for the above configuration fails:

```ts
expect(() => {
  parser.parse(['cmd-one']).call();
}).toThrow('cmd-one expects 1 argument, got 0');
expect(() => {
  parser.parse(['cmd-none-strict', 'hello']).call();
}).toThrow('cmd-none-strict expects 0 arguments, got 1');
```

## External Declaration

You can declare your subcommands outside of the building phase by stopping early and then using the `CommandHandler` helper type, similar as for globals. Again, due to TypeScript and the builder pattern, you need to declare your options and globals _before_ you can declare your subcommand so that the subcommand arguments, options and globals can be inferred correctly.

```ts
import { Parser } from '@eegli/tinyparse';
import type { CommandHandler } from '@eegli/tinyparse';

const subcommandHandler: CommandHandler<typeof options, [string]> = (
  params,
) => {
  const { args, options, globals } = params;
  const [userName] = args;
  let greeting = `Greetings from ${globals.fromUser} to ${userName}!`;

  if (options.uppercase) {
    greeting = greeting.toUpperCase();
  }
  console.log(greeting);
};

const options = new Parser()
  .option('uppercase', {
    longFlag: '--uppercase',
    shortFlag: '-u',
    defaultValue: false,
  })
  .setGlobals(() => ({
    fromUser: 'John',
  }));

const parser = options
  .subcommand('send-greeting', {
    args: ['from'] as const,
    handler: subcommandHandler,
  })
  .defaultHandler();

parser.parse(['send-greeting', 'Mary']).call();
expect(consoleLog).toHaveBeenCalledWith('Greetings from John to Mary!');
parser.parse(['send-greeting', 'Mary', '-u']).call();
expect(consoleLog).toHaveBeenCalledWith('GREETINGS FROM JOHN TO MARY!');
```

## Good to Know

- The types of all subcommand _arguments_ (`arg1`, etc.) are not validated. They will all be of type `string` because that is exactly what `stdin` gives us
- If there is _no positional argument_ that matches a subcommand, the default handler is called. If you require a subcommand is called, you can handle this case in the default handler
