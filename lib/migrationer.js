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
    var setup = this.setup;

    setup.getActiveList(function(err, activeIds) {
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

        var inactiveMigrations = availableMigrations.filter(function(migration) {
            var isActive = activeIds.indexOf(migration.id) >= 0;
            return isActive ? offset < 0 : offset > 0;
        });

        // slice off the appropriate number according to the offset
        inactiveMigrations = Array.prototype.slice.apply(inactiveMigrations, offset > 0 ? [0, offset] : [offset]);
        if (offset < 0) {
            inactiveMigrations.reverse();
        }

        var direction = offset > 0 ? 'up' : 'down';

        runner(inactiveMigrations, function(migration, next) { // entry
            migration.run(direction, function(err) {
                if (err) {
                    return mig.finish(err);
                }
                mig.count++;
                mig.emit(direction, migration.path);
                var save = setup[direction == 'up' ? 'setActive' : 'setInactive'];
                save(migration.id, function(err) {
                    if (err) {
                        return mig.finish(err);
                    }
                    next();
                });
            });
        }, function() { // done
            setup.end(function() {
                mig.finish();
            });
        });
    });
};

Migrationer.prototype.finish = function(err) {
    if (err) {
        this.emit('error', err);
    }
    this.emit('complete', this.count);
};

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
