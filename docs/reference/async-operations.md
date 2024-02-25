# Async Operations

> This document describes how asynchronous operations are handled.

Tinyparse is asynchronous by default, allowing you to run asynchronous code in any of the three configuration areas:

- **Global setters**: Using the options from the user input, you might want to establish a connection to a remote database
- **Subcommand handlers**: You might want to perform asynchronous operations in the subcommand handlers and await them
- **Default handler**: You might want to perform asynchronous operations in the default handler and await them

When you parse arguments, calling `.call()` returns a `Promise`. This is so that any asynchronous handlers and setters can be awaited. In most cases, you will not need to await the returned `Promise` because `call()` is assumed to be the _last code to be executed_ at top-level. If unawaited, the parsing happens after all synchronous code has been executed.

> One scenario in which it makes sense to `await` is testing. For example, all the tests for Tinyparse are asynchronous because they need to check what happens after the parser has been called.

Here's an example using Jest:

```ts
const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

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

await parser.call();

expect(consoleLog).toHaveBeenCalledWith('Hello, John!');
```
