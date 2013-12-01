var defaultSetup = require('./default-setup.js'),
    runner = require('./queue-runner.js'),
    Migration = require('./migration.js'),
    xtend = require('xtend'),
    util = require('util'),
    fs = require('fs'),
    EventEmitter = require('events').EventEmitter;

function Migrationer(dir) {
    EventEmitter.call(this);

    this.dir = dir;
    // XXX could have the method accept this instead
    this.setup = xtend({}, defaultSetup(dir), require(dir + '/setup.js'));
    this.count = 0;
}
util.inherits(Migrationer, EventEmitter);

Migrationer.prototype.migrate = function(offset) {
    var mig = this;

    this.setup.getActiveList(function(err, activeIds) {
        if (err) {
            return mig.finish(err);
        }

        if (!Array.isArray(activeIds)) {
            return mig.finish(new Error("active ids returned from the migration adapter is not an array"));
        }

        // not trusting the input
        activeIds = activeIds.map(function(id) {
            // force string
            return "" + id;
        });

        // get a list of the files inside the directory, and generate
        // a sorted list of them as Migration objects
        var availableMigrations = getAvailableMigrations(mig.dir);

        var migrationsToRun = availableMigrations.filter(function(migration) {
            var isActive = activeIds.indexOf(migration.id) >= 0;
            return isActive ? offset < 0 : offset > 0;
        });

        // slice off the appropriate number according to the offset
        migrationsToRun = Array.prototype.slice.apply(migrationsToRun, offset > 0 ? [0, offset] : [offset]);
        if (offset < 0) {
            migrationsToRun.reverse();
        }

        runMigrations(mig, migrationsToRun, offset > 0 ? 'up' : 'down');
    });
};

Migrationer.prototype.finish = function(err) {
    if (err) {
        this.emit('error', err);
    }
    this.emit('complete', this.count);
};

function runMigrations(mig, migrations, direction) {
    runner(migrations, function(migration, next) { // entry
        migration.run(direction, function(err) {
            if (err) {
                return mig.finish(err);
            }
            mig.count++;
            mig.emit(direction, migration.path);
            var save = mig.setup[direction == 'up' ? 'setActive' : 'setInactive'];
            save(migration.id, function(err) {
                if (err) {
                    return mig.finish(err);
                }
                next();
            });
        });
    }, function() { // done
        mig.setup.end(function() {
            mig.finish();
        });
    });
}

function getAvailableMigrations(dir) {
    // XXX This logic should probably belong in the same place as the thing
    // to generate the filename
    return fs.readdirSync(dir).filter(function(filename) {
        return filename.match(/^\d{17}.*\.js$/);
    }).map(function(filename) {
        return new Migration(dir, filename);
    }).sort(function(a, b) {
        a.id - b.id;
    });
}

module.exports = Migrationer;
