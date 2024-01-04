---
'@eegli/tinyparse': minor
---

It is now possible to set a constraint on the number of positional arguments using the following symbols: `'<=', '>=', '=', '*'`.

Syntax: `<symbol><number>`

Examples:

- `>=1` means that the number of positional arguments must be at least 1.
- `<=1` means that the number of positional arguments must be at most 1.
- `=1` means that the number of positional arguments must be exactly 1.
- `*` means that the number of positional arguments is not constrained (the default behavior).

If the number of positional arguments does not match the constraint, the parser will throw a `ValidationError`.
