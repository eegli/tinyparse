# CLI Arguments

> Definitions from [CLI Flags Explained](https://oclif.io/blog/2019/02/20/cli-flags-explained) with inspiration from [CLI Guidelines](https://clig.dev/).

Tinyparse:

- Matches **subcommands and their positional arguments**
- Parses and validates **long and short flag options**

All arguments until the first flag are considered **subcommands** (and their arguments), that is, they are _positional_ arguments. After positional arguments - if there are any - **options** (also called _flags_) may follow. Flags are always global. Long flags start with two hyphens (`--`), short flags with a single hyphen (`-`). A valid _flag-argument_ pair consists of a _flag_ followed by the _flag argument_, separated by a whitespace or equal sign. Whereas the order _does_ matter for positonal arguments, it does _not_ matter for flags.

| Example            | Abstract format                                        | Support |
| ------------------ | ------------------------------------------------------ | ------- |
| `status`           | `[subcommand]`                                         | ✅      |
| `clone git@github` | `[subcommand] [subcommand arg]`                        | ✅      |
| `commit -m "wip"`  | `[subcommand] [subcommand arg] [long flag] [flag arg]` | ✅      |
| `log -n 5`         | `[subcommand] [short flag] [flag arg]`                 | ✅      |

The table above depicts a few common ways of how arguments can be passed to a CLI using git as an example. Tinyparse supports all of them as well as arbitrary combinations. **Everything from subcommands to flags is completely optional**. You can build a CLI that only takes positional arguments, only flags, or a mix of both.

## Limitations

As of now, Tinyparse supports only subcommands in the first level. Furthermore, all options are global, meaning you cannot (yet) define options that are only valid for a specific subcommand.

I am planning to support arbitrary nesting of subcommands and options in the future, maybe via allowing a dedicated subparser for each subcommand.
