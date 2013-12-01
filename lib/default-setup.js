// Default file-based migration manager
var fs = require('fs');

var activeFile = '.active';

function getList(path) {
    try {
        var contents = fs.readFileSync(path, 'utf-8');
        return contents.split("\n").filter(Boolean);
    } catch (e) {
        return [];
    }
}

module.exports = function(dir) {
    var path = dir + "/" + activeFile;
    return {
        start: function(next) {
            next();
        },

        end: function(next) {
            next();
        },

        getActiveList: function(next) {
            try {
                next(null, getList(path));
            } catch (e) {
                next(null, []);
            }
        },

        setActive: function(id, next) {
            var list = getList(path);
            if (list.indexOf(id) < 0) {
                list.push(id);
            }

            try {
                fs.writeFileSync(path, list.join("\n"));
                next();
            } catch (e) {
                next(e);
            }
        },

        setInactive: function(id, next) {
            var list = getList(path),
                i;
            while ((i = list.indexOf(id)) >= 0) {
                list[i] = null;
            }
            list.filter(Boolean);

            try {
                fs.writeFileSync(path, list.join("\n"));
                next();
            } catch (e) {
                next(e);
            }
        }
    };
};
