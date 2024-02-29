# CLI Arguments

> Definitions from [CLI Flags Explained](https://oclif.io/blog/2019/02/20/cli-flags-explained) with inspiration from [CLI Guidelines](https://clig.dev/).

Tinyparse:

- Matches **subcommands and their positional arguments**
- Parses and validates **long and short flag options**

All arguments until the first flag are considered **subcommands** (and their arguments), that is, they are _positional_ arguments. After positional arguments - if there are any - **options** (also called _flags_) may follow. Flags are always global. Long flags start with two hyphens (`--`), short flags with a single hyphen (`-`). A valid _flag-argument_ pair consists of a _flag_ followed by the _flag argument_, separated by a whitespace or equal sign. Whereas the order _does_ matter for positonal arguments, it does _not_ matter for flags.

| Example                            | Abstract format                              | Support |
| ---------------------------------- | -------------------------------------------- | ------- |
| _git_ `--namespace=<name>`         | `[long flag] [flag arg]`                     | ✅      |
| _git_ `status`                     | `[subcmd]`                                   | ✅      |
| _git_ `commit -m "wip"`            | `[subcmd] [long flag] [flag arg]`            | ✅      |
| _git_ `clone git@github --verbose` | `[subcmd] [subcmd arg] [boolean short flag]` | ✅      |

The table above depicts a few common ways of how arguments can be passed to a CLI using git as an example. Tinyparse supports all of them as well as arbitrary combinations. **Everything from subcommands to flags is completely optional**. You can build a CLI that only takes positional arguments, only flags, or a mix of both.
