# Milkshake

Simple database migration tool inspired by [migrate](https://npmjs.org/package/migrate) and
the rails migration tool.

- Migration scripts are stored in a folder, with a timestamp + ID + name identifier
  and are written in pure JS
- By default it stores which migrations have been run on the filesystem, but you can easily
  extend and change that behavior.
- You can have setup and teardown scripts run before and after migrations
- It will attempt to fail gracefully by saving which migrations have been run each time
  one has been run, and not all-or-nothing.

### Usage

Install using:
```sh
$ npm install milkshake
```
(To install globally use `npm install -g milkshake`)

To initialize a new migration folder:
```sh
$ milkshake init
```
This will create an empty folder in your current working directory named `migrations`
and include a setup.js file by default. (Hint: Look in lib/default-setup.js to see
the methods you can override in your own setup file, eg. for inserting active
migrations or removing from your own database).

Create a new migration file:
```sh
$ milkshake new "Create table users"
```
This will generate a new empty migration file named `<timestamp>-Create_table_users.js`
in the `migrations` folder.

You can list the migrations that will be run (changes not yet reflected in your database) by using
the command:
```sh
$ milkshake list
```

To run the migration:
```sh
$ milkshake migrate
```

To run a downwards migration (downgrades, undos, whatever you'd call them):
```sh
$ milkshake migrate:down
```

And then you can run a single upwards migration (also applies to downwards migrations) by appending
a number after the command:
```sh
$ milkshake migrate:up 2
```

To see the full command line options:
```sh
$ milkshake --help
```

### Full list of commands and options
```sh
  Usage: milkshake [options] command

  Options:
     -c, --chdir <path>     Change the working directory to a given migration
                            directory. eg. /home/billybob/myapp/migrations
                            If no path is given, it defaults to ./migrations
     -h, --help             Show this help screen
     -v, --version          Displays the current version
     -d, --dry, --dry-run   Dry run of migrations (shows you which migrations would
                            by run with a migration command)

  Commands:
     init               Initialize an initial migration directory and helper file(s)

     migrate            Migrate up to the latest migration
     migrate:up [n]     Migrate up by n migrations (default 1)
     migrate:down [n]   Migrate down by n migrations (default 1)

     list               List the migrations to be run (same as running
                        the command 'milkshake migrate --dry-run'

     wrong              List migrations that show up as active even though there is
                        no matching migration file (indicating that you did something
                        wrong in version control (not implemented yet)

     new [title]        Create a new migration file with optional title
     generate [title]   Alias for 'new'
     create [title]     Alias for 'new'
```

### TODO
- Maybe the MigrationDir thing should be a more traditional class-like thing
- Write more tests
- There might be some error cases we could handle better.
- Implement the command to list applied migrations that don't exist (helpful for
  debugging)

*Pull requests welcome*

### License

MIT license
