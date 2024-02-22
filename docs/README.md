## Tinyparse

![npm](https://img.shields.io/npm/v/@eegli/tinyparse) ![GitHub Workflow Status (branch)](https://img.shields.io/github/actions/workflow/status/eegli/tinyparse/ci.yml?branch=main) [![codecov](https://codecov.io/gh/eegli/tinyparse/branch/main/graph/badge.svg?token=8MFDR4SWYM)](https://codecov.io/gh/eegli/tinyparse) ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@eegli/tinyparse)

> A tiny, type-safe and flexible utility for creating command line tools in Node.js

## What it is

_Like [oclif](https://oclif.io/) and [Yargs](https://yargs.js.org/) had a baby._

```ts
import { Parser } from '@eegli/tinyparse';

new Parser()
  .option('occasion', {
    longFlag: '--occasion',
    shortFlag: '-o',
    defaultValue: '',
    required: true,
  })
  .subcommand('congratulate', {
    args: ['name'] as const,
    handler: ({ args, options }) => {
      const [name] = args;
      const { occasion } = options;
      console.log(`Happy ${occasion}, ${name}!`);
    },
  })
  .defaultHandler(() => {
    console.log('Please enter your name');
  })
  .parse(['congratulate', 'John', '--occasion', 'birthday'])
  .call();

// Happy birthday, John!
```

I use this mostly for other pet projects of mine so it comes with some opinions 🤪.

## Features

- TypeScript first - 100% type-safety
- Supports subcommands and flag options
- Lightweight - Zero dependencies
- Mega customizable

## Examples

- Check out the extensive [test suites](https://github.com/eegli/tinyparse/tree/main/test) or
- Play in the dedicated [Code Sandbox](https://codesandbox.io/s/tinyparse-sandbox-pknk4?file=/src/index.ts)

## Resources

This project has been guided by the amazing [Command Line Interface Guidelines](https://clig.dev/) by Aanand Prasad, Ben Firshman, Carl Tashian and Eva Parish.

Further inspiration has been taken from the [Apache Commons CLI](https://commons.apache.org/proper/commons-cli/).
