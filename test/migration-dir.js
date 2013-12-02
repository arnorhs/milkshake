/**
 * Tests the functionality of MigrationDir - wether generating files etc
 * all works as expected
 */
var assert = require('assert'),
    fs = require('fs'),
    MigrationDir = require('../lib/migration-dir')
    Migration = require('../lib/migration');

var dir = __dirname + "/mock_migrate";
var md;

beforeEach(function() {
    md = MigrationDir(dir);
});


describe("Migration dir", function() {
    it("should report being a migration dir", function() {
        assert(md.isMigrationDir, "not migration dir");
    });

    it("should have the same directory as was supplied", function() {
        assert(md.dir === dir, "Not the same directory");
    });

    describe("before initialization", function() {
        it("should not be initialized", function() {
            assert(!md.isInitialized(), "is initialized");
        });
    });

    describe("after initialization", function() {
        beforeEach(function() {
            md.initialize();
        });

        afterEach(function() {
            fs.readdirSync(dir).forEach(function(file) {
                fs.unlinkSync(dir + "/" + file);
            });
            fs.rmdirSync(dir);
        });

        it("should report as initialized", function() {
            assert(md.isInitialized(), "is not initialized");
        });

        it("should result in there being a file at dir/setup.js", function() {
            assert(fs.existsSync(dir + "/setup.js"), "setup.js doesn't exist");
        });

        describe("initializer", function() {
            it("should have the correct methods", function() {
                var i = md.getInitializer();
                ["start", "end", "getActiveList", "setActive", "setInactive"].forEach(function(key) {
                    assert(typeof i[key] == 'function', key + " is not a function");
                });
            });
        });

        describe("Generating a migration file", function() {
            describe("without a title", function() {
                it("should return a filename which will exist", function() {
                    var path = md.generate();
                    assert(path.match(/\d{17}\.js$/), "path should match regular expression");
                    assert(fs.existsSync(path), "File does not exist");
                });
            });

            describe("with a title", function() {
                it("should return a filename which will exist", function() {
                    var path = md.generate("a title");
                    assert(path.match(/\d{17}\-a\_title\.js$/), "path should match regular expression");
                    assert(fs.existsSync(path), "File does not exist");
                });
            });

            describe("and calling getMigrations", function() {
                it("should return a list of all the generated migrations", function() {
                    var path = md.generate("a title");
                    var list = md.getMigrations();
                    assert(list[0] instanceof Migration, "index 0 is not an instance of Migration");
                    assert(list[0].path === path, "Path is not correct");
                });
            });
        });
    });
});
