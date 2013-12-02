var fs = require('fs');

var encoding = 'utf-8';

module.exports = {
    fileEncoding: encoding,

    getTemplate: function(name) {
        return fs.readFileSync(__dirname + '/../res/' + name, encoding);
    }
};
