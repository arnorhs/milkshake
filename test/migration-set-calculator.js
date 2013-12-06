/**
 * Tests the function that calculates the set of migrations to run
 */

var assert = require('assert'),
    calc = require('../lib/migration-set-calculator');

var mockMigrations = [ {id: "1"}, {id: "2"}, {id: "3"} ];
var mockMigrationsUnsorted = [ {id: "9"}, {id: "2"}, {id: "7"} ];

describe("Calculating", function() {
    describe("migrations", function() {
        describe("with an invalid activeIds array", function() {
            it("should produce an error", function() {
                try {
                    calc([], {}, 0);
                    assert(false, "Did not produce an error");
                } catch(e) {
                }
            });
        });

        describe("with no active ids", function() {
            it("should return the same array", function() {
                var arr = calc(mockMigrations, [], 5);
                assert(arr.length === mockMigrations.length, "Arrays are not the same length");

                arr = calc(mockMigrations, [], -5);
                assert(arr.length === 0, "Array should be empty");
                // XXX check contents?
            });

            it("should be sorted correctly", function() {
                var arr = calc(mockMigrationsUnsorted, [], 5);
                assert(arr.length === mockMigrations.length, "Arrays are not the same length");
                assert(arr[0].id === "2" && arr[1].id === "7" && arr[2].id === "9", "Array is not sorted");
            });
        });

        describe("with all active ids", function() {
            it("should return an empty array", function() {
                var arr = calc(mockMigrations, [1,2,3], 5);
                assert(arr.length === 0, "Array should have 0 things in it");
                arr = calc(mockMigrations, [1,2,3], -5);
                assert(arr.length === 3, "Array should have 3 things in it");
                arr = calc(mockMigrations, [3,2,1], 5);
                assert(arr.length === 0, "Array should have 0 things in it with positive offset and reversed actives");
                // XXX check contents?
            });
        });

        describe("with 2 active ids and 2 ids not in the list", function() {
            it("should return an array with one element", function() {
                var active = [1,3,6,9];
                var arr = calc(mockMigrations, active, 5);
                assert(arr.length === 1, "Array should have 0 things in it");
                assert(arr[0].id === "2", "Array element 0 should have id === 2");
                // XXX check contents?
            });
        });

        describe("with an offset of +/- 2", function() {
            it("should have the first two elements or last two depending on offset", function() {
                var arr = calc(mockMigrations, [], 2);
                assert(arr.length === 2, "array is not the correct length");
                assert(arr[0].id === "1" && arr[1].id === "2", "Not the correct set of migrations");

                arr = calc(mockMigrations, [1,2,3], -2);
                assert(arr.length === 2, "array is not the correct length");
                assert(arr[0].id === "3" && arr[1].id === "2", "Not the correct set of migrations");
                // XXX check contents?
            });
        });
    });
});
