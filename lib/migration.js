function Migration(dir, filename) {
    this.path = dir + "/" + filename;
    this.id = filename.match(/^\d{17}/)[0];
}

module.exports = Migration;

Migration.prototype.run = function(direction, done) {
    try {
        require(this.path)[direction](done);
    } catch (e) {
        done(e);
    }
};
