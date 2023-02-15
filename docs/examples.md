# Examples

Here's a full example on how you could build a minimal command line interface with Tinyparse.

Make sure your `package.json`'s `type` field is set to `module` or convert the `import` to a `require` statement.

Then, invoke the script like so:

```bash
node main.js --name eric --hasDog

```

```js
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
```
