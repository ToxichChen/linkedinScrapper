const DBManager = require('./DBManager');

// ---------Start---------
// Reading values from console
let searchArguments = [];
let query = '';
let database = new DBManager();
process.argv.forEach(function (val, index) {
    if (index > 1) {
        searchArguments.push(val);
    }
});
company = searchArguments[0];
searchArguments.forEach(element => query = query + ' ' + element)

database.saveSearchQueryToDatabase(query.trim());
