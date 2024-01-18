# Handlers

Because of the way the builder pattern works with TypeScript, you should always declare any options and globals _before_ you set any subcommand handlers. Handlers "see" what has previously been chained to the parser but now what will come. Hence, TypeScript will complain, although the parsing result will be correct.
