const LinkedIn = require('./LinkedInScraper');

// ---------Start---------
// Reading values from console
let searchArguments = [];
let query = '';
let LinkedInScraper = new LinkedIn();
process.argv.forEach(function (val, index) {
    if (index > 1) {
        searchArguments.push(val);
    }
});
company = searchArguments[0];
searchArguments.forEach(element => query = query + ' ' + element)

LinkedInScraper.saveSearchQueryToDatabase(query.trim());
LinkedInScraper.closeDatabaseConnection();