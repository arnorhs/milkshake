var defaultSetup = require('./default-setup.js'),
    Migration = require('./migration.js'),
    xtend = require('xtend'),
    fs = require('fs');

module.exports = function(dir) {
    return {
        isMigrationDir: true,

        initializer: xtend({}, defaultSetup(dir), require(dir + '/setup.js')),

        getMigrations: function() {
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
    };
};

