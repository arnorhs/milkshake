var args = require('optimist').argv,
    shell = require('./lib/shell-helpers'),
    Migrationer = require('./lib/migrationer');

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
var dir = shell.resolveDir(customDir);

// If the intention was not to init, we want to make sure the directory
// exists and has a file named 'init.js'
var shellReady = shell.isReady(dir);

if (!shellReady && command != 'setup') {
    shell.printSetupInstructions(dir, !!customDir);
    process.exit(1);
} else if (shellReady && command == 'setup') {
    shell.print('red', "The specified migration directory (" + dir + ") already looks set up");
    process.exit(1);
}

function migrateWrapper(offset) {
    var migrationer = new Migrationer(dir);
    migrationer.on('up', function(name) {
        shell.print("up: " + name);
    });
    migrationer.on('down', function(name) {
        shell.print("down: " + name);
    });
    migrationer.on('complete', function(count) {
        shell.print('green', "Done. " + count + " migrations ran successfully");
    });
    migrationer.on('error', function(err) {
        shell.print("red", "Error in running migrations");
        shell.print(err.stack);
    });
    migrationer.migrate(offset);
}

switch (command) {
    case 'setup':
        shell.setup(dir);
        shell.print("green", "Migration folder was set up at '" + dir + "'");
        break;
    case 'generate':
    case 'create':
    case 'new':
        var title = args._.join("_");
        var path = shell.generate(dir, title);
        shell.print("green", "Created " + path);
        break;
    case 'migrate':
        shell.print("magenta", "Migrating all the way up");
        migrateWrapper(Number.MAX_VALUE);
        break;
    case 'migrate:up':
        var count = parseInt(args._.shift() || 1, 10);
        shell.print("magenta", "Migrating up " + count);
        migrateWrapper(count);
        break;
    case 'migrate:down':
        var count = parseInt(args._.shift() || 1, 10);
        shell.print("magenta", "Migrating down " + count);
        migrateWrapper(-count);
        break;
    default:
        shell.print('red', "Unknown command: " + command);
        process.exit(1);
}
