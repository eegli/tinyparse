# Async Operations

> This document describes how the parser can operate in **asynchronous** mode.

In some cases, you may have asynchronous code in any of the three configuration areas:

- **Global setters**: Using the options from the user input, you might want to establish a connection to a remote database
- **Subcommand handlers**: You might want to perform asynchronous operations in the subcommand handlers and await them
- **Default handler**: You might want to perform asynchronous operations in the default handler and await them

In general, the parser is designed so that any call to `call()` is the last code to be executed at top-level. Hence, you do not need to await it - it will simply be run after all synchronous code has been executed. However, you might want to await that call, for example, to perform end-to-end testing.

It is possible to use Tinyparse with its _asynchronous_ call API:

```ts
const parser = new Parser()
  .option('token', {
    longFlag: '--token',
    required: true,
    defaultValue: '',
  })
  .setGlobals(async ({ token }) => {
    // Use the token to establish a connection
    return { database: async (name: string) => name };
  })
  .defaultHandler(async ({ args, globals }) => {
    const user = await globals.database(args[0]);
    console.log(`Hello, ${user}!`);
  })
  .parse(['John', '--token', '123']);

await parser.callAsync(); // Async call API
expect(consoleLog).toHaveBeenCalledWith('Hello, John!');
```

## Async Validation

If your handlers or setters contain **any asynchronous code**, you should use the `callAsync()` method to await the parser's execution. **An error is thrown** if you try to use the sync API with asynchronous handlers or setters.

```ts
expect(() => {
  new Parser()
    .setGlobals(async () => {
      return { database: async (name: string) => name };
    })
    .defaultHandler(async ({ globals }) => {
      const user = await globals.database('John');
      console.log(`Hello, ${user}!`);
    })
    .parse([])
    .call(); // Whoops, wrong API
}).toThrow('callAsync must be used with an async global setter');
```

Unfortunately, I haven't found a way to enforce calling the right API just by inferring the signatures of async handlers and setters. Hence, you need to make sure you're using the correct API. If in doubt, use the `callAsync()` method.
