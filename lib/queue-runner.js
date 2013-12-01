module.exports = function(list, entry, done) {
    var run = function() {
        var item = list.shift();
        if (!item) {
            done();
            return;
        }
        entry(item, function() {
            run();
        });
    };
    run();
};
