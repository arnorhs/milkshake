var spurt = require('spurt'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    migrationSetCalculator = require('./migration-set-calculator');

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

MigrationRunner.prototype.migrate = function(offset, dry) {
    var mig = this;
    var initializer = this.migrationDir.getInitializer();

    initializer.start(function(err) {
        if (err) return mig.finish(err);

        initializer.getActiveList(function(err, activeIds) {
            if (err) return mig.finish(err);

            // get a list of the files inside the directory, and generate
            // a sorted list of them as Migration objects
            try {
                var migrationsToRun = migrationSetCalculator(mig.migrationDir.getMigrations(), activeIds, offset);
            } catch(e) {
                return mig.finish(e);
            }

            var direction = offset > 0 ? 'up' : 'down';
            if (dry) {
                runDryMigrations(mig, migrationsToRun, direction);
            } else {
                runMigrations(mig, migrationsToRun, direction);
            }
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

function runDryMigrations(mig, migrations, direction) {
    migrations.forEach(function(migration) {
        mig.emit(direction, migration.path);
    });
    mig.finish();
}

module.exports = MigrationRunner;
