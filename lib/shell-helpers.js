var path = require('path'),
    fs = require('fs');

var encoding = 'utf-8';

var colors = {
    red: ['\x1B[31m', '\x1B[39m'],
    green: ['\x1B[32m', '\x1B[39m'],
    magenta: ['\x1B[35m', '\x1B[39m'],
    normal: ['', '']
};

function getTemplate(name) {
    return fs.readFileSync(__dirname + '/../res/' + name, encoding);
}

function print() {
    var string = (arguments[1] ? arguments[1] : arguments[0]).split("\n"),
        color = colors[arguments[1] ? arguments[0] : 'normal'];
    string.forEach(function(str) {
        console.log("  " + color[0] + str + color[1]);
    });
}

function generateId() {
    // returns a timestamp, including MS, with all the symbols removed
    return new Date().toISOString().replace(/T|\-|:|\.|Z/g,"");
}

module.exports = {
    resolveDir: function(dir) {
        return typeof dir === 'string' ? path.resolve(dir) : process.cwd() + '/migrations';
    },

    isReady: function(dir) {
        return fs.existsSync(dir + "/setup.js");
    },

    print: print,

    printHelp: function() {
        console.log(getTemplate('help.txt'));
    },

    generate: function(dir, title) {
        var filePath = dir + "/" + generateId();
        if (title) {
            filePath += "-" + title.replace(/\s|\.|\//g, "_");
        }
        filePath += ".js";
        fs.writeFileSync(filePath, getTemplate('migration-template.js'), encoding);
        return filePath;
    },

    printSetupInstructions: function(dir, customDir) {
        print('red', "Migration directory not set up at '" + dir + "'");
        if (customDir) {
            print("Make sure the path you specified correctly points to a migration directory");
        } else {
            print("Make sure you are in the correct working directory, or specify a path using -c or --chdir");
        }
        print("First time? Use 'milkshake setup' to set up a new migration directory");
    },

    setup: function(dir) {
        fs.mkdirSync(dir);
        fs.writeFileSync(dir + '/setup.js', getTemplate('setup-template.js'));
    }
};

