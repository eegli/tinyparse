# Custom Validation

Imagine you expect input that is a valid [JavaScript date string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse). By default, Tinyparse will simply check that the _received type_ for a flag matches its _expected type_. In the example below, the value for `birthDate` is a of type `string`, enough for the parser to be satisfied by default.

Custom validation lets you **hook into the validation process** and enforce your own rules. It can be configured on a per-argument/flag basis. Each `customValidator`, if specified, must define a validation function `isValid` along with a custom `errorMessage` helper that informs the user about the error.

A custom validator has the following signature. It receives the received value as input and the (formatted) flag for which this value has been encountered. Its return type is a _type predicate_:

```ts
type CustomValidator = {
  isValid: (value: unknown) => value is Value;
  errorMessage: (value: unknown, flag: string) => string;
};
```

Note that, when you're using TypeScript, custom validators need to be [explicitly annotated](https://github.com/microsoft/TypeScript/issues/14826#issuecomment-288870523) using the `Value` type as in the example below.

- More info about type [predicates and narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)

## Example

<!-- doctest: custom validation -->

```ts
import { createParser, Value } from '@eegli/tinyparse';

const { parseSync } = createParser(
  { birthDate: '2000-01-01' },
  {
    options: {
      birthDate: {
        longFlag: 'bday',
        customValidator: {
          isValid(value): value is Value {
            if (typeof value !== 'string') return false;
            return !isNaN(new Date(value).getTime());
          },
          errorMessage(value, flag) {
            return `Invalid value '${value}' for option '${flag}'. Expected a valid date string`;
          },
        },
      },
    },
  }
);
// Valid date string
expect(() => {
  parseSync(['--bday', '2000-01-01']);
}).toBeTruthy();

// What a weird month...
expect(() => {
  parseSync(['--bday', '2000-22']);
}).toThrow(
  "Invalid value '2000-22' for option '--bday'. Expected a valid date string"
);
```
