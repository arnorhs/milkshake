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
```
npm install milkshake
```

To setup a new migration folder:
```
milkshake setup
```
This will create an empty folder in your current working directory named `migrations`
and include a setup.js file by default. (Hint: Look in lib/default-setup.js to see
the methods you can override in your own setup file, eg. for inserting active
migrations or removing from your own database).

Create a new migration file:
```
milkshake new "Create table users"
```
This will generate a new empty migration file named `<timestamp>-Create_table_users.js`
in the `migrations` folder.

To run the migration:
```
milkshake migrate
```

To see the full command line options:
```
milkshake --help
```

### TODO:
- Write unit tests
- There might be some error cases we could handle better.
- Commands for listing migrations that haven't been run

*Pull requests welcome*

### License

MIT license
