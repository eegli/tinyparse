#!/usr/bin/bash

// filename: main.js

import { createParser } from '@eegli/tinyparse';

const { parse, help } = createParser(
  {
    name: '',
    hasDog: false,
  },
  {
    options: {
      name: {
        required: true,
        description: 'Your name',
      },
      hasDog: {
        shortFlag: 'd',
      },
    },
  }
);

(async () => {
  if (process.argv.includes('--help')) {
    console.log(help());
    return;
  }

  const { name, hasDog } = await parse(process.argv);

  const dogString = `You ${hasDog ? 'have' : "don't have"} a dog :)`;

  console.log(`Hi, ${name}! ${dogString}`);
})();
