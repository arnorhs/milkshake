var args = require('optimist').argv,
    shell = require('./lib/shell-helpers'),
    MigrationDir = require('./lib/migration-dir'),
    MigrationRunner = require('./lib/migration-runner');

var command = args._.shift();

if (command == 'version' || args.v || args.version) {
    shell.print("Milkshake v" + require('./package.json').version);
    process.exit();
}

if (command == 'help' || !command || args.help || args.h) {
    shell.printHelp();
    process.exit();
}

var customDir = args.c || args.chdir;
var migrationDir = MigrationDir(customDir);

// If the intention was not to init, we want to make sure the directory
// exists and has a file named 'init.js'
var initialized = migrationDir.isInitialized();

function ensureInitialized() {
    if (!initialized) {
        shell.printInitInstructions(migrationDir.dir, !!customDir);
        process.exit(1);
    }
}

// XXX time to move this to shell helpers?
function migrateWrapper(offset, dry) {
    var dryStr = dry ? " (dry run)" : "";
    var runner = new MigrationRunner(migrationDir);
    runner.on('up', function(name) {
        shell.print("up: " + name + dryStr);
    });
    runner.on('down', function(name) {
        shell.print("down: " + name + dryStr);
    });
    runner.on('complete', function(count) {
        shell.print('green', "Done. " + count + " migrations ran successfully");
    });
    runner.on('error', function(err) {
        shell.print("red", "Error in running migrations");
        shell.print(err.stack);
    });
    runner.migrate(offset, dry);
}

var isDry = !!args.dry || !!args["dry-run"];

if (isDry && ['init', 'generate', 'create', 'new'].indexOf(command) !== -1) {
    shell.print("red", "Dry run not supported for '" + command + "'");
    process.exit(1);
}

switch (command) {
    case 'init':
        if (initialized) {
            shell.print('red', "The specified migration directory (" + migrationDir.dir + ") already looks initialized");
            process.exit(1);
        }
        migrationDir.initialize();
        shell.print("green", "Migration folder was initialized at '" + migrationDir.dir + "'");
        break;
    case 'generate':
    case 'create':
    case 'new':
        ensureInitialized();
        var title = args._.join("_");
        var path = migrationDir.generate(title);
        shell.print("green", "Created " + path);
        break;
    case 'list':
        ensureInitialized();
        shell.print("magenta", "These migrations would be run:");
        migrateWrapper(Number.MAX_VALUE, true);
        break;
    case 'migrate':
        ensureInitialized();
        shell.print("magenta", "Migrating all the way up" + (isDry ? " (dry run)" : ""));
        migrateWrapper(Number.MAX_VALUE, isDry);
        break;
    case 'migrate:up':
        ensureInitialized();
        var count = parseInt(args._.shift() || 1, 10);
        shell.print("magenta", "Migrating up " + count + (isDry ? " (dry run)" : ""));
        migrateWrapper(count, isDry);
        break;
    case 'migrate:down':
        ensureInitialized();
        var count = parseInt(args._.shift() || 1, 10);
        shell.print("magenta", "Migrating down " + count + (isDry ? " (dry run)" : ""));
        migrateWrapper(-count, isDry);
        break;
    default:
        shell.print('red', "Unknown command: " + command);
        process.exit(1);
}
