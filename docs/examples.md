# Examples

Here's a full example on how you could build a minimal command line interface with Tinyparse.

We're building the interface for a small CLI tool that copies or moves files from one folder to another. The user can specify a file extension, a date after which the files were created, and whether to ignore folders. The user can also specify a number of files to copy/move. The first argument is a positional argument, i.e., it is not prefixed by a flag. It can either be `copy` or `move`. The second and third arguments are positional arguments as well, but they can be any value.

Make sure your `package.json`'s `type` field is set to `module` or convert the `import` to a `require` statement.

Then, invoke the script like so:

```bash
node cli.js move src/images dest/images --ext .jpg -i --first 10 --after 2018
```

Or

```bash
node cli.js --help
```

```js
#!/usr/bin/bash

// filename: cli.js

import { createParser, ValidationError } from '@eegli/tinyparse';

const { parseSync, help } = createParser(
  {
    verbose: false,
    extensions: '',
  },
  {
    options: {
      verbose: {
        shortFlag: 'v',
        description: 'Show more information about the operation',
      },
      extensions: {
        longFlag: 'ext',
      },
    },
    commands: {
      cp: {
        args: ['from', 'to'],
        description: 'Copy files from one folder to another',
      },
      ls: {
        args: ['folder'],
        description: 'List files in a folder',
      },
      rm: {
        args: '...files',
      },
      status: {
        args: [],
        description: 'Show the status of the repository',
      },
    },
  },
);

const copy = (from, to) => console.log(`Copying ${from} to ${to}`);
const list = (folder) => console.log(`Listing ${folder}`);
const remove = (files) => console.log(`Removing ${files.join(', ')}`);
const status = () => console.log('Showing status');

const run = (argv) => {
  if (argv.includes('--help')) {
    console.info(help());
  }

  try {
    const { _: commands, verbose, extensions } = parseSync(argv);
    console.info('Options:', { verbose, extensions });

    const [command] = commands;

    switch (command) {
      case 'cp':
        const [, from, to] = commands;
        return copy(from, to);
      case 'ls':
        const [, folder] = commands;
        return list(folder);
      case 'rm':
        const [, ...files] = commands;
        return remove(files);
      case 'status':
        return status();
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Error: ' + error.message);
      console.info(help());
    }
  }
};

run(process.argv.slice(2));
```
