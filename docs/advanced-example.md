# Advanced Example

Here's a full example on how you could build a minimal command line interface with Tinyparse.

We're building a small CLI tool does various file operations. The tool supports various (optional) subcommands. We require that at least one subcommand is specified. Since Tinyparse does not enforce this by default, we need to do it manually.

Make sure your `package.json`'s `type` field is set to `module` or convert the `import` to a `require` statement.

Here are some ways in which you could run the CLI

```sh
node cli.js status
node cli.js cp src dest -v
node cli.js ls folder --ext=js,ts
node cli.js rm file1 file2 file3 file4
node cli.js --help
node cli.js unknown
node cli.js
```

```ts
// filename: cli.ts

import { CommandHandler, ErrorHandler, Parser } from '@eegli/tinyparse';

type Options = typeof options;

const copy: CommandHandler<Options, [string, string]> = ({ args }) => {
  const [from, to] = args;
  console.log(`Copying files from ${from} to ${to}`);
};

const list: CommandHandler<Options, [string]> = ({ args, globals }) => {
  const [folder] = args;
  const { extensions } = globals;
  console.log(
    `Listing files in ${folder} with extension ${extensions.join(' or ')}`,
  );
};

const remove: CommandHandler<Options> = ({ args }) => {
  console.log(`Removing files ${args}`);
};

const status: CommandHandler<Options> = ({ globals }) => {
  const { userName } = globals;
  console.log(`Showing status for user: ${userName}`);
};

const handleError: ErrorHandler = (error, args) => {
  console.error(`Error parsing arguments. Received: ${args}. ${error.message}`);
};

const handleDefault: CommandHandler<Options> = ({ args, globals, options }) => {
  console.info({ options, args, globals });
};

const options = new Parser()
  .option('verbose', {
    longFlag: '--verbose',
    shortFlag: '-v',
    defaultValue: false,
    description: 'Show more information about the operation',
  })
  .option('extensions', {
    longFlag: '--ext',
    defaultValue: '',
    description: 'Comma-separated list of file extensions to include',
  })
  .globals((options) => {
    return {
      logger: options.verbose ? console.log : () => {},
      userName: 'me',
      extensions: options.extensions.split(','),
    };
  });

const parser = options
  .subcommand('cp', {
    handler: copy,
    args: ['from', 'to'] as const,
    description: 'Copy files from one folder to another',
  })
  .subcommand('ls', {
    handler: list,
    args: ['folder'] as const,
    description: 'List files in a folder',
  })
  .subcommand('rm', {
    handler: remove,
    args: '...files',
  })
  .subcommand('status', {
    handler: status,
    args: [] as const,
    description: 'Show the status of the repository',
  })
  .defaultHandler(handleDefault);

const run = (args: string[]) => {
  parser.parse(args, handleError).call();
};

run(process.argv.slice(2));
```
