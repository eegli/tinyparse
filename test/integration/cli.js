#!/usr/bin/bash

// filename: cli.js

import { createParser } from '@eegli/tinyparse';

const { parseSync, help } = createParser(
  {
    fileExtensions: '',
    first: Infinity,
    ignoreFolders: false,
    afterDate: '',
  },
  {
    options: {
      fileExtensions: {
        required: true,
        longFlag: 'ext',
      },
      ignoreFolders: {
        shortFlag: 'i',
      },
      afterDate: {
        longFlag: 'after',
        customValidator: {
          isValid: (value) => {
            if (value === '') return true;
            const date = new Date(value);
            return !Number.isNaN(date.getTime());
          },
        },
      },
    },
    positionals: {
      expect: [['copy', 'move'], null, null],
      caseSensitive: true,
    },
  },
);

export default function run(argv) {
  if (argv.includes('--help')) {
    return help();
  }

  const {
    _: [operation, from, to],
    fileExtensions,
    ignoreFolders,
    first,
    afterDate,
  } = parseSync(argv);

  return `You want to:
  - ${operation} the first ${first} files with extension ${fileExtensions}
  - from ${from}
  - to ${to}
  - after ${afterDate}
  - and ${ignoreFolders ? 'ignore' : 'include'} any subfolders`;
}

/* const result = run(process.argv.slice(2));
console.info(result); */
