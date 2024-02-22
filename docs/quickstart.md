# Quickstart

## Install

Node.js v18 or later is required.

```bash
yarn add @eegli/tinyparse
```

or

```bash
npm i @eegli/tinyparse
```

## Usage

Tinyparse uses a type-safe builder pattern to create a parser. A parser is created with a call to `new Parser()`. Everything that follows is now optional.

```ts
import { Parser } from '@eegli/tinyparse';

const parser = new Parser();
```

First, we can specify any global options (a.k.a. _flags_) and _chain_ them.

```ts
const parser = new Parser().option('verbose', {
  longFlag: '--verbose',
  shortFlag: '-v',
  defaultValue: false,
});
```

Next, we attach globals. Globals are supposed to _static_ objects that can be used by any subcommand. For example, you could attach a logger to the parser or define constants. Globals have access to all options.

```ts
const parser = new Parser()
  .option('verbose', {
    longFlag: '--verbose',
    shortFlag: '-v',
    defaultValue: false,
  })
  .setGlobals((options) => ({
    callDatabase: (name: string) => `Hello, ${name}!`,
    log: (message: string) => {
      if (options.verbose) {
        console.log(message);
      }
    },
  }));
```

Now, we register a handler for a subcommand. (Subcommand) handlers have access to their arguments, globals and options.

```ts
const parser = new Parser()
  .option('verbose', {
    longFlag: '--verbose',
    shortFlag: '-v',
    defaultValue: false,
  })
  .setGlobals((options) => ({
    callDatabase: (name: string) => `Hello, ${name}!`,
    log: (message: string) => {
      if (options.verbose) {
        console.log(message);
      }
    },
  }))
  .subcommand('fetch-user', {
    args: ['user-name'] as const,
    handler: ({ args, globals }) => {
      const [userName] = args;
      const result = globals.callDatabase(userName);
      globals.log(result);
    },
  });
```

To allow the user to get help, we register metadata such as the app name, a summary as well as version and help commands. All of this is optional but recommended. If you do not specify a help command, Tinyparse will not assume one for you.

```ts
const parser = new Parser()
  .option('verbose', {
    longFlag: '--verbose',
    shortFlag: '-v',
    defaultValue: false,
  })
  .setGlobals((options) => ({
    callDatabase: (name: string) => `Hello, ${name}!`,
    log: (message: string) => {
      if (options.verbose) {
        console.log(message);
      }
    },
  }))
  .subcommand('fetch-user', {
    args: ['user-name'] as const,
    handler: ({ args, globals }) => {
      const [userName] = args;
      const result = globals.callDatabase(userName);
      globals.log(result);
    },
  })
  .setMeta({
    appName: 'my-cli',
    summary: 'A brief description of my-cli',
    help: {
      command: 'help',
      longFlag: '--help',
    },
    version: {
      version: '1.0.0',
      command: 'version',
      longFlag: '--version',
    },
  });
```

Finally, we wrap up the building phase by attaching a _default handler_- a special handler that is called when no subcommand matches.

```ts
const parser = new Parser()
  .option('verbose', {
    longFlag: '--verbose',
    shortFlag: '-v',
    defaultValue: false,
  })
  .setGlobals((options) => ({
    callDatabase: (name: string) => `Hello, ${name}!`,
    log: (message: string) => {
      if (options.verbose) {
        console.log(message);
      }
    },
  }))
  .subcommand('fetch-user', {
    args: ['user-name'] as const,
    handler: ({ args, globals }) => {
      const [userName] = args;
      const result = globals.callDatabase(userName);
      globals.log(result);
    },
  })
  .setMeta({
    appName: 'my-cli',
    summary: 'A brief description of my-cli',
    help: {
      command: 'help',
      longFlag: '--help',
    },
    version: {
      version: '1.0.0',
      command: 'version',
      longFlag: '--version',
    },
  })
  .defaultHandler(({ globals }) => {
    globals.log('No command specified');
  });
```

Now, we are ready to give it an array of strings, which is usually the command line arguments obtained from `process.argv.slice(2)`:

```ts
parser.parse(['fetch-user', 'John', '-v']).call();
```

This will print `Hello, John!` to the console.

To see all available commands, we can also do:

```ts
parser.parse(['--help']).call();
```

There are many more things you can do with Tinyparse. Checkout the reference!
