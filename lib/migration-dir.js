var defaultSetup = require('./default-setup.js'),
    Migration = require('./migration.js'),
    util = require('./util'),
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
            fs.writeFileSync(dir + '/setup.js', util.getTemplate('setup-template.js'));
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
            });
        },

        generate: function(title) {
            var filePath = dir + "/" + generateId();
            if (title) {
                filePath += "-" + title.replace(/\s|\.|\//g, "_");
            }
            filePath += ".js";
            fs.writeFileSync(filePath, util.getTemplate('migration-template.js'), util.encoding);
            return filePath;
        }
    };
};

function generateId() {
    // returns a timestamp, including MS, with all the symbols removed
    return new Date().toISOString().replace(/T|\-|:|\.|Z/g,"");
}
