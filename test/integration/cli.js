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
    subcommands: {
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

const copy = (from, to) => `Copying ${from} to ${to}`;
const list = (folder) => `Listing ${folder}`;
const remove = (files) => `Removing ${files.join(', ')}`;
const status = () => 'Showing status';

export const run = (argv) => {
  if (argv.includes('--help')) {
    return help();
  }

  try {
    const { _: commands, verbose, extensions } = parseSync(argv);

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
      default:
        if (command) {
          // Unknown command
          return `Error: Unknown command ${command}`;
        }

        // No command
        return help();
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return 'Error: ' + error.message;
    }
    throw error;
  }
};

const result = run(process.argv.slice(2));
console.log(result);
