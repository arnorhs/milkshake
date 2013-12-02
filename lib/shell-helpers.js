var util = require('./util');

var colors = {
    red: ['\x1B[31m', '\x1B[39m'],
    green: ['\x1B[32m', '\x1B[39m'],
    magenta: ['\x1B[35m', '\x1B[39m'],
    normal: ['', '']
};

function print() {
    var string = (arguments[1] ? arguments[1] : arguments[0]).split("\n"),
        color = colors[arguments[1] ? arguments[0] : 'normal'];
    string.forEach(function(str) {
        console.log("  " + color[0] + str + color[1]);
    });
}

module.exports = {
    print: print,

    printHelp: function() {
        console.log(util.getTemplate('help.txt'));
    },

    printInitInstructions: function(dir, customDir) {
        print('red', "Migration directory not initialized at '" + dir + "'");
        if (customDir) {
            print("Make sure the path you specified correctly points to a migration directory");
        } else {
            print("Make sure you are in the correct working directory, or specify a path using -c or --chdir");
        }
        print("First time? Use 'milkshake init' to set up a new migration directory");
    }
};

