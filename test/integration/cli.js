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

const copy = (from, to) => console.log(`Copying ${from} to ${to}`);
const list = (folder) => console.log(`Listing ${folder}`);
const remove = (files) => console.log(`Removing ${files.join(', ')}`);
const status = () => console.log('Showing status');

const run = (argv) => {
  if (argv.includes('--help')) {
    console.log(help());
  }

  try {
    const { _: commands, verbose, extensions } = parseSync(argv);
    console.log('Options:', { verbose, extensions });

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
        console.log('Error: Unknown command');
        console.log(help());
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log('Error: ' + error.message);
      console.log(help());
    }
  }
};

run(process.argv.slice(2));
