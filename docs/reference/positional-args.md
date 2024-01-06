# Positional Arguments

By default, Tinyparse simply collects all positional arguments in an array on the `_` property. You can put additional constraints on positional arguments, e.g., set a range of allowed values.

By default - see the example in [Command Line Arguments](reference/cli-arguments?id=positional-arguments) , there is no constraint on positional arguments. They will be inferred by TypeScript as `string[]`.

However, often times, you might have either:

- A _fixed number_ of positional arguments
- A _range of allowed_ positional arguments
- Both

Also, wouldn't it be great if we could have type-safety for positional arguments to easily handle different types of arguments? We can!

## Examples

In the following example, specify that we expect _exactly_ two positional arguments. The first one can take two possible values, the second one can take _any_ value. This is done by setting it to `null`. We also optionally specify that our arguments are case-sensitive (`false` by default).

One of the best things about TypeScript is that it will **infer the type of the positional arguments** for us. In this case, it will be `['ls' | 'cd', string]`. You simply have to annotate your `expect` array with `as const` to make this work. Otherwise, TypeScript will infer the type as `string[]`.

<!-- doctest: cli arguments, positional arguments 2 -->

```ts
import { createParser } from '@eegli/tinyparse';

const { parseSync } = createParser(
  {},
  {
    positionals: {
      expect: [['ls', 'cd'], null] as const,
      caseSensitive: true,
    },
  },
);
// TS infers that this is of type  ["ls" | "cd", string]
const positionals = parseSync(['ls', '/directory'])._;
expect(positionals).toStrictEqual(['ls', '/directory']);
```

What happens if the user's input does not match the expected positional arguments? Here, the argument is uppercase, which is not allowed. Tinyparse will throw an error.

```ts
expect(() => {
  parseSync(['CD', 'my-app']);
}).toThrow(
  "Invalid positional argument: Expected one of: 'ls', 'cd'. Got 'CD'",
);
```

Lastly, you can optionally specify that you want to error for any additional positional arguments that are not expected. This is done by setting `rejectAdditional` to `true`. By default, addional positional arguments are ignored.

```ts
import { createParser } from '@eegli/tinyparse';

const { parseSync } = createParser(
  {},
  {
    positionals: {
      expect: [['ls'], null] as const,
      rejectAdditional: true,
    },
  },
);

expect(parseSync(['ls', 'folder'])).toStrictEqual({
  _: ['ls', 'folder'],
});

expect(() => {
  parseSync(['ls', 'folder', 'another-folder']);
}).toThrow('Invalid number of positional arguments: Expected at most 2, got 3');
```
