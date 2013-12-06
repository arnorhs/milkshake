module.exports = function(availableMigrations, activeIds, offset) {
    if (!Array.isArray(activeIds)) {
        throw new Error("active ids returned from the migration adapter is not an array");
    }

    // not trusting the input
    activeIds = activeIds.map(function(id) {
        // force string
        return "" + id;
    });

    var migrationsToRun = availableMigrations.filter(function(migration) {
        var isActive = activeIds.indexOf(migration.id) >= 0;
        return isActive ? offset < 0 : offset > 0;
    }).sort(function(a, b) {
        // XXX this is pretty inefficient
        return parseInt(a.id, 10) - parseInt(b.id, 10);
    });

    // slice off the appropriate number according to the offset
    migrationsToRun = Array.prototype.slice.apply(migrationsToRun, offset > 0 ? [0, offset] : [offset]);
    if (offset < 0) {
        migrationsToRun.reverse();
    }

    return migrationsToRun;
};
