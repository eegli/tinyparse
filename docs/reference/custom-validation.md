# Custom Validation

Imagine you expect input that is a valid [JavaScript date string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse). By default, Tinyparse will simply check that the _received type_ for a flag matches its _expected type_. In the example below, the value for `birthDate` is a of type `string`, enough for the parser to be satisfied.

Custom validation lets you **hook into the validation process** and enforce your own rules. It can be configured on a per-argument/flag basis. Each `customValidator`, if specified, must define a validation function `isValid` along with a custom `errorMessage` helper that informs the user about the error.

A custom validator has the following signature:

```ts
  customValidator?: {
    isValid: (value: unknown) => boolean;
    errorMessage: (value: unknown) => string;
  };
```

## Example

<!-- doctest: custom validation -->

```ts
import { createParser } from '@eegli/tinyparse';

const { parse } = createParser(
  { birthDate: '2000-01-01' },
  {
    options: {
      birthDate: {
        customValidator: {
          isValid(value) {
            if (typeof value !== 'string') return false;
            return !isNaN(new Date(value).getTime());
          },
          errorMessage(value) {
            return `Invalid value '${value}' for option
            'birthDate'. Expected a valid date string`;
          },
        },
      },
    },
  }
);
// Valid date string
await expect(parse(['--birthDate', '2000-01-01'])).resolves.toBeTruthy();

// What a weird month...
await expect(parse(['--birthDate', '2000-22'])).rejects.toThrow();
```
