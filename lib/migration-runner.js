var spurt = require('spurt'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

function MigrationRunner(migrationDir) {
    EventEmitter.call(this);

    if (!migrationDir.isMigrationDir) {
        throw new Error("variable passed into MigrationRunner constructor is not a migration directory thing");
    }
    this.migrationDir = migrationDir;

    // num migrations that were run
    this.count = 0;
}
util.inherits(MigrationRunner, EventEmitter);

MigrationRunner.prototype.migrate = function(offset) {
    var mig = this;
    var initializer = this.migrationDir.getInitializer();

    initializer.start(function(err) {
        if (err) return mig.finish(err);

        initializer.getActiveList(function(err, activeIds) {
            if (err) return mig.finish(err);

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
            var migrationsToRun = calculateMigrationsToRun(mig.migrationDir.getMigrations(), activeIds, offset);

            runMigrations(mig, migrationsToRun, offset > 0 ? 'up' : 'down');
        });
    });
};

MigrationRunner.prototype.finish = function(err) {
    if (err) {
        this.emit('error', err);
    }
    var mig = this;
    this.migrationDir.getInitializer().end(function() {
        mig.emit('complete', mig.count);
    });
};

function calculateMigrationsToRun(availableMigrations, activeIds, offset) {
    var migrationsToRun = availableMigrations.filter(function(migration) {
        var isActive = activeIds.indexOf(migration.id) >= 0;
        return isActive ? offset < 0 : offset > 0;
    });

    // slice off the appropriate number according to the offset
    migrationsToRun = Array.prototype.slice.apply(migrationsToRun, offset > 0 ? [0, offset] : [offset]);
    if (offset < 0) {
        migrationsToRun.reverse();
    }

    return migrationsToRun;
}

function runMigrations(mig, migrations, direction) {
    spurt(migrations, function(migration, next) { // entry
        migration.run(direction, function(err) {
            if (err) return mig.finish(err);

            mig.count++;
            mig.emit(direction, migration.path);
            var save = mig.migrationDir.getInitializer()[direction == 'up' ? 'setActive' : 'setInactive'];
            save(migration.id, function(err) {
                if (err) return mig.finish(err);

                next();
            });
        });
    }, function() { // done
        mig.finish();
    });
}

module.exports = MigrationRunner;
