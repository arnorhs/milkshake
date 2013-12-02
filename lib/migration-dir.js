var defaultSetup = require('./default-setup.js'),
    Migration = require('./migration.js'),
    path = require('path'),
    xtend = require('xtend'),
    fs = require('fs');

module.exports = function(dir) {

    dir = typeof dir === 'string' ? path.resolve(dir) : process.cwd() + '/migrations';

    var initializer;

    return {
        isMigrationDir: true,

        dir: dir,

        isInitialized: function() {
            return fs.existsSync(dir + "/setup.js");
        },

        initialize: function() {
            fs.mkdirSync(dir);
            fs.writeFileSync(dir + '/setup.js', getTemplate('setup-template.js'));
        },

        getInitializer: function() {
            if (!initializer) {
                initializer = xtend({}, defaultSetup(dir), require(dir + '/setup.js'));
            }
            return initializer;
        },

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

function getTemplate(name) {
    return fs.readFileSync(__dirname + '/../res/' + name, "utf-8");
}
