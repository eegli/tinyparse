## Tinyparse

![npm](https://img.shields.io/npm/v/@eegli/tinyparse) ![GitHub Workflow Status (branch)](https://img.shields.io/github/actions/workflow/status/eegli/tinyparse/ci.yml?branch=main) [![codecov](https://codecov.io/gh/eegli/tinyparse/branch/main/graph/badge.svg?token=8MFDR4SWYM)](https://codecov.io/gh/eegli/tinyparse) ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@eegli/tinyparse)

> A tiny, type-safe and flexible utility for parsing & validating command line arguments in Node.js

## What it is

_Like [oclif](https://oclif.io/) and [Yargs](https://yargs.js.org/) had a baby._

```ts
import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';

const { parse } = createParser({
  username: '',
});

const parsed = await parse(['hello', '--username', 'eegli']);

assert.deepStrictEqual(parsed, { username: 'eegli', _: ['hello'] });
```

I use this mostly for other pet projects of mine so it comes with some opinions 🤪.

## Features

- TypeScript first - 100% type-safety
- Support for subcommands
- Support for flag arguments
- Lightweight - Zero dependencies
- JSON parsing, custom validation and more

## Examples

- Check out the extensive [test suites](https://github.com/eegli/tinyparse/tree/main/test) or
- Play in the dedicated [Code Sandbox](https://codesandbox.io/s/tinyparse-sandbox-pknk4?file=/src/index.ts)

## Resources

This project has been guided by the amazing [Command Line Interface Guidelines](https://clig.dev/) by Aanand Prasad, Ben Firshman, Carl Tashian and Eva Parish.

Further inspiration has been taken from the [Apache Commons CLI](https://commons.apache.org/proper/commons-cli/).
