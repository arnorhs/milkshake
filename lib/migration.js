function Migration(dir, filename) {
    this.path = dir + "/" + filename;
    this.id = filename.match(/^\d{17}/)[0];
}

module.exports = Migration;

Migration.prototype.run = function(direction, done) {
    return require(this.path)[direction](done);
};
