// filename: cli.js

import { Parser } from '@eegli/tinyparse';

const log = (message) => console.log(message);

const copy = (options, from, to) => log(`Copying ${from} to ${to}`);
const list = (options, folder) => log(`Listing ${folder}`);
const remove = (options, files) => log(`Removing ${files.join(', ')}`);
const status = (options) => log('Showing status');

const parser = new Parser()
  .flag('verbose', {
    longFlag: '--verbose',
    shortFlag: '-v',
    defaultValue: false,
    description: 'Show more information about the operation',
  })
  .flag('extensions', {
    longFlag: '--ext',
    defaultValue: '',
  })
  .build()
  .subcommand('cp', {
    handler: copy,
    args: ['from', 'to'],
    description: 'Copy files from one folder to another',
  })
  .subcommand('ls', {
    handler: list,
    args: ['folder'],
    description: 'List files in a folder',
  })
  .subcommand('rm', {
    handler: remove,
    args: '...files',
  })
  .subcommand('status', {
    handler: status,
    args: [],
    description: 'Show the status of the repository',
  })
  .defaultHandler((flags, ...args) => {
    console.error(`Error: Unknown command ${args[0]}`);
  });

export const run = (args) => {
  const { call, options } = parser.parse(args);
  console.log(options);

  call();
};

run(process.argv.slice(2));
